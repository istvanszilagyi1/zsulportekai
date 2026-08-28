export type OrderEmailInput = {
  id?: string;
  customer_name?: string;
  customer_email?: string;
  delivery_method?: 'foxpost' | 'home_delivery';
  payment_method?: 'bank_transfer' | 'stripe';
  total_price?: number;
  items?: Array<{
    title?: string;
    quantity?: number;
    price?: number;
  }>;
  foxpost_place_name?: string;
  foxpost_place_address?: string;
  shipping_address?: string;
};

const formatMoney = (value: number) => `${Number(value || 0).toLocaleString('hu-HU')} Ft`;

const buildItemSummary = (items: OrderEmailInput['items'] = []) => {
  if (!items.length) {
    return 'Nincs megadva terméklista.';
  }

  return items
    .map((item) => `${item.title ?? 'Termék'} × ${item.quantity ?? 1} — ${formatMoney((item.price ?? 0) * (item.quantity ?? 1))}`)
    .join('<br />');
};

const buildDeliveryText = (order: OrderEmailInput) => {
  if (order.delivery_method === 'foxpost') {
    return `Foxpost csomagautomata: ${order.foxpost_place_name ?? 'nincs megadva'} — ${order.foxpost_place_address ?? ''}`.trim();
  }

  return `Házhozszállítás: ${order.shipping_address ?? 'A cím megadása folyamatban van.'}`;
};

export async function sendOrderEmails(order: OrderEmailInput) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  const fromAddress = process.env.EMAIL_FROM || 'Zsül Portékái <noreply@zsulportekai.hu>';

  if (!resendApiKey) {
    console.info('RESEND_API_KEY missing, skipping automatic order email dispatch.');
    return { sent: false, reason: 'missing_resend_api_key' };
  }

  const customerEmail = order.customer_email;
  const orderId = order.id ?? 'ismeretlen';
  const items = Array.isArray(order.items) ? order.items : [];
  const deliveryLine = buildDeliveryText(order);
  const paymentLabel = order.payment_method === 'stripe' ? 'Online fizetés' : 'Banki átutalás';

  const customerHtml = `
    <div style="font-family: Arial, sans-serif; color: #201d1a; line-height: 1.6;">
      <h2 style="margin-bottom: 12px; color: #2d2922;">Köszönjük a megrendelést!</h2>
      <p>Szép napot! A rendelésedet rögzítettük a Zsül Portékái webshopban.</p>
      <p><strong>Megrendelés azonosító:</strong> #${orderId}</p>
      <p><strong>Vevő:</strong> ${order.customer_name ?? 'N/A'}</p>
      <p><strong>Fizetési mód:</strong> ${paymentLabel}</p>
      <p><strong>Szállítás:</strong> ${deliveryLine}</p>
      <div style="margin-top: 18px; padding: 14px 18px; background: #f8f3eb; border-radius: 12px;">
        <strong>Rendelés tartalma:</strong><br />
        ${buildItemSummary(items)}
      </div>
      <p style="margin-top: 18px;"><strong>Végösszeg:</strong> ${formatMoney(Number(order.total_price ?? 0))}</p>
      <p>A banki átutalási részleteket külön e-mailben elküldjük, amint a rendelés feldolgozásra kerül.</p>
      <p>Üdvözlettel,<br />Zsül Portékái</p>
    </div>
  `;

  const customerText = [
    'Köszönjük a megrendelést!',
    `Megrendelés azonosító: #${orderId}`,
    `Vevő: ${order.customer_name ?? 'N/A'}`,
    `Fizetési mód: ${paymentLabel}`,
    `Szállítás: ${deliveryLine}`,
    `Rendelés tartalma: ${items.map((item) => `${item.title ?? 'Termék'} x ${item.quantity ?? 1}`).join(', ') || 'Nincs megadva'}`,
    `Végösszeg: ${formatMoney(Number(order.total_price ?? 0))}`,
    'A banki átutalási részleteket külön e-mailben elküldjük.',
    'Üdvözlettel: Zsül Portékái',
  ].join('\n');

  const adminHtml = `
    <div style="font-family: Arial, sans-serif; color: #201d1a; line-height: 1.6;">
      <h2 style="margin-bottom: 12px; color: #2d2922;">Új megrendelés érkezett</h2>
      <p><strong>Megrendelés azonosító:</strong> #${orderId}</p>
      <p><strong>Vevő:</strong> ${order.customer_name ?? 'N/A'}</p>
      <p><strong>E-mail:</strong> ${order.customer_email ?? 'N/A'}</p>
      <p><strong>Fizetési mód:</strong> ${paymentLabel}</p>
      <p><strong>Szállítási mód:</strong> ${order.delivery_method === 'foxpost' ? 'Foxpost automata' : 'Házhozszállítás'}</p>
      <p><strong>Szállítási hely:</strong> ${deliveryLine}</p>
      <div style="margin-top: 18px; padding: 14px 18px; background: #f8f3eb; border-radius: 12px;">
        <strong>Termékek:</strong><br />
        ${buildItemSummary(items)}
      </div>
      <p style="margin-top: 18px;"><strong>Végösszeg:</strong> ${formatMoney(Number(order.total_price ?? 0))}</p>
    </div>
  `;

  const sendEmail = async (to: string, subject: string, text: string, html: string) => {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [to],
        subject,
        text,
        html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Resend email failed (${response.status}): ${errorBody}`);
    }

    return response.json();
  };

  const recipients: Array<{ to: string; subject: string; text: string; html: string }> = [];

  if (customerEmail) {
    recipients.push({
      to: customerEmail,
      subject: 'Rendelés visszaigazolás – Zsül Portékái',
      text: customerText,
      html: customerHtml,
    });
  }

  if (adminEmail) {
    recipients.push({
      to: adminEmail,
      subject: `Új rendelés érkezett – #${orderId}`,
      text: customerText,
      html: adminHtml,
    });
  }

  if (!recipients.length) {
    return { sent: false, reason: 'no_recipients' };
  }

  await Promise.all(recipients.map((recipient) => sendEmail(recipient.to, recipient.subject, recipient.text, recipient.html)));

  return { sent: true, count: recipients.length };
}
