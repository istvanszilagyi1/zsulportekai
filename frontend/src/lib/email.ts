import nodemailer from 'nodemailer';

export type OrderEmailInput = {
  id?: string;
  customer_name?: string;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_email?: string;
  delivery_method?: 'foxpost' | 'home_delivery';
  payment_method?: 'bank_transfer' | 'stripe';
  total_price?: number;
  items?: Array<{
    title?: string;
    quantity?: number;
    price?: number;
    image?: string;
  }>;
  foxpost_place_name?: string;
  foxpost_place_address?: string;
  shipping_address?: string;
  status?: string;
};

export type SendTransactionalEmailOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  from?: string;
};

export const BRAND_NAME = 'Zsül Portékái';
export const BRAND_LOGO_URL = 'https://4e95f92e87.clvaw-cdnwnd.com/389d5bb8ea9eaf71fc35b4ed841e1326/200000204-8933c8933e/450/Zs%C3%BCl%20port%C3%A9k%C3%A1i%20logo.webp?ph=4e95f92e87';
export const BRAND_SUPPORT_EMAIL = 'zsulportekai@gmail.com';

const formatMoney = (value: number) => `${Number(value || 0).toLocaleString('hu-HU')} Ft`;

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const buildItemSummary = (items: OrderEmailInput['items'] = []) => {
  if (!items.length) {
    return '<p style="margin: 0; color: #6a625d;">Nincs megadva terméklista.</p>';
  }

  return items
    .map((item) => {
      const title = escapeHtml(item.title ?? 'Termék');
      const qty = Number(item.quantity ?? 1);
      const lineTotal = Number(item.price ?? 0) * qty;
      return `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #efe5d8; color: #2d2922; font-size: 14px;">${title}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #efe5d8; color: #2d2922; font-size: 14px; text-align: center;">${qty}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #efe5d8; color: #2d2922; font-size: 14px; text-align: right;">${formatMoney(lineTotal)}</td>
        </tr>
      `;
    })
    .join('');
};

const buildDeliveryText = (order: OrderEmailInput) => {
  if (order.delivery_method === 'foxpost') {
    return `Foxpost csomagautomata: ${order.foxpost_place_name ?? 'nincs megadva'} — ${order.foxpost_place_address ?? ''}`.trim();
  }

  return `Házhozszállítás: ${order.shipping_address ?? 'A cím megadása folyamatban van.'}`;
};

const getCustomerDisplayName = (order: OrderEmailInput) => {
  const firstName = (order.customer_first_name ?? '').trim();
  const lastName = (order.customer_last_name ?? '').trim();

  if (firstName || lastName) {
    return [lastName, firstName].filter(Boolean).join(' ') || 'N/A';
  }

  return (order.customer_name ?? '').trim() || 'N/A';
};

const renderEmailLayout = ({
  title,
  subtitle,
  intro,
  bodyHtml,
  ctaText,
  ctaLink,
  footerNote,
}: {
  title: string;
  subtitle: string;
  intro: string;
  bodyHtml: string;
  ctaText?: string;
  ctaLink?: string;
  footerNote?: string;
}) => `
  <div style="background:#f5efe8;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#201d1a;">
    <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e8dfd3;border-radius:24px;overflow:hidden;box-shadow:0 18px 40px rgba(35,28,21,.08);">
      <div style="padding:24px 28px 16px;background:linear-gradient(135deg,#f7f1e6 0%,#ffffff 100%);border-bottom:1px solid #eee1d0;">
        <img src="${BRAND_LOGO_URL}" alt="${BRAND_NAME}" style="display:block;max-width:220px;height:auto;margin:0 auto 16px;border-radius:12px;" />
        <div style="text-align:center;letter-spacing:0.16em;text-transform:uppercase;font-size:11px;font-weight:700;color:#7a7066;">${subtitle}</div>
        <h1 style="margin:12px 0 0;text-align:center;font-size:32px;line-height:1.15;font-weight:700;color:#2d2922;">${title}</h1>
      </div>
      <div style="padding:26px 28px 8px;">
        <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#4f4943;">${intro}</p>
        ${bodyHtml}
      </div>
      ${ctaText && ctaLink ? `
        <div style="padding:0 28px 22px;">
          <a href="${ctaLink}" style="display:inline-block;padding:14px 22px;background:#2d2922;color:#ffffff;text-decoration:none;border-radius:999px;font-weight:700;letter-spacing:0.02em;">${ctaText}</a>
        </div>
      ` : ''}
      <div style="padding:0 28px 24px;">
        <div style="border-top:1px solid #eee3d4;padding-top:18px;font-size:13px;line-height:1.7;color:#645d55;">
          ${footerNote ? `<p style="margin:0 0 8px;">${footerNote}</p>` : ''}
          <p style="margin:0;">Üdvözlettel: <strong>${BRAND_NAME}</strong><br />E-mail: ${BRAND_SUPPORT_EMAIL}</p>
        </div>
      </div>
    </div>
  </div>
`;

const getEmailTransport = () => {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 465);
  const secure = process.env.SMTP_SECURE !== undefined ? process.env.SMTP_SECURE === 'true' : true;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
};

async function sendViaResend({ to, subject, text, html, replyTo, from }: SendTransactionalEmailOptions) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return null;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: from || process.env.EMAIL_FROM || `${BRAND_NAME} <noreply@zsulportekai.hu>`,
      to: [to],
      reply_to: replyTo || process.env.EMAIL_REPLY_TO || BRAND_SUPPORT_EMAIL,
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
}

async function sendViaSmtp({ to, subject, text, html, replyTo, from }: SendTransactionalEmailOptions) {
  const transporter = getEmailTransport();
  if (!transporter) {
    return null;
  }

  const fromAddress = from || process.env.EMAIL_FROM || process.env.MAILER_FROM || `${BRAND_NAME} <${process.env.SMTP_USER || process.env.EMAIL_USER || process.env.GMAIL_USER || BRAND_SUPPORT_EMAIL}>`;

  await transporter.sendMail({
    from: fromAddress,
    to,
    replyTo: replyTo || process.env.EMAIL_REPLY_TO || BRAND_SUPPORT_EMAIL,
    subject,
    text,
    html: html || `<div>${text}</div>`,
  });

  return { ok: true };
}

export async function sendTransactionalEmail(options: SendTransactionalEmailOptions) {
  const resendResult = await sendViaResend(options).catch(() => null);
  if (resendResult) {
    return { sent: true, provider: 'resend' };
  }

  const smtpResult = await sendViaSmtp(options).catch((error) => {
    console.error('SMTP email delivery failed:', error);
    return null;
  });

  if (smtpResult) {
    return { sent: true, provider: 'smtp' };
  }

  return { sent: false, reason: 'missing_email_provider' };
}

const buildOrderConfirmationBody = (order: OrderEmailInput) => {
  const customerDisplayName = getCustomerDisplayName(order);
  const deliveryLine = buildDeliveryText(order);
  const paymentLabel = order.payment_method === 'stripe' ? 'Online fizetés' : 'Banki átutalás';
  const orderId = order.id ?? 'ismeretlen';
  const items = Array.isArray(order.items) ? order.items : [];
  const productRows = buildItemSummary(items);

  return `
    <div style="display:block;padding:18px 0 8px;">
      <div style="background:#f8f3eb;border:1px solid #eee1d0;border-radius:18px;padding:18px 16px;margin-bottom:18px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr>
            <td style="font-size:13px;text-transform:uppercase;letter-spacing:0.12em;color:#7a7066;padding-bottom:8px;">Megrendelés azonosító</td>
            <td style="font-size:13px;text-transform:uppercase;letter-spacing:0.12em;color:#7a7066;padding-bottom:8px;text-align:right;">Összeg</td>
          </tr>
          <tr>
            <td style="font-size:24px;font-weight:700;color:#2d2922;">#${escapeHtml(String(orderId))}</td>
            <td style="font-size:24px;font-weight:700;color:#2d2922;text-align:right;">${formatMoney(Number(order.total_price ?? 0))}</td>
          </tr>
        </table>
      </div>

      <table style="width:100%;border-collapse:collapse;margin:6px 0 18px;background:#ffffff;border:1px solid #eee2d5;border-radius:12px;overflow:hidden;">
        <thead>
          <tr style="background:#f6f0e8;">
            <th style="padding:12px 12px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:0.12em;color:#756d66;">Termék</th>
            <th style="padding:12px 12px;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:0.12em;color:#756d66;">Db</th>
            <th style="padding:12px 12px;text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:0.12em;color:#756d66;">Összeg</th>
          </tr>
        </thead>
        <tbody>
          ${productRows}
        </tbody>
      </table>

      <div style="background:#faf7f3;border:1px solid #efe4d4;border-radius:16px;padding:16px 18px;">
        <p style="margin:0 0 9px;font-size:14px;line-height:1.8;color:#4b4641;"><strong>Vásárló:</strong> ${escapeHtml(customerDisplayName)}</p>
        <p style="margin:0 0 9px;font-size:14px;line-height:1.8;color:#4b4641;"><strong>Fizetési mód:</strong> ${paymentLabel}</p>
        <p style="margin:0 0 9px;font-size:14px;line-height:1.8;color:#4b4641;"><strong>Szállítás:</strong> ${escapeHtml(deliveryLine)}</p>
        <p style="margin:0;font-size:14px;line-height:1.8;color:#4b4641;"><strong>Átvétel:</strong> ${order.delivery_method === 'foxpost' ? 'Foxpost automata' : 'Házhozszállítás'}</p>
      </div>
    </div>
  `;
};

const buildOrderStatusBody = (order: OrderEmailInput, statusLabel: string, statusMessage: string) => {
  const customerDisplayName = getCustomerDisplayName(order);
  const orderId = order.id ?? 'ismeretlen';
  const deliveryLine = buildDeliveryText(order);
  const paymentLabel = order.payment_method === 'stripe' ? 'Online fizetés' : 'Banki átutalás';

  return `
    <div style="display:block;padding:18px 0 8px;">
      <div style="background:#eef6ef;border:1px solid #d5ead9;border-radius:18px;padding:18px 16px;margin-bottom:18px;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#4d7b60;font-weight:700;">Státusz</p>
        <h2 style="margin:0;color:#1d4d2a;font-size:28px;line-height:1.2;">${statusLabel}</h2>
      </div>
      <div style="background:#faf7f3;border:1px solid #efe4d4;border-radius:16px;padding:16px 18px;">
        <p style="margin:0 0 10px;font-size:15px;line-height:1.7;color:#3d3935;">${statusMessage}</p>
        <p style="margin:0 0 9px;font-size:14px;line-height:1.8;color:#4b4641;"><strong>Megrendelés:</strong> #${escapeHtml(String(orderId))}</p>
        <p style="margin:0 0 9px;font-size:14px;line-height:1.8;color:#4b4641;"><strong>Vásárló:</strong> ${escapeHtml(customerDisplayName)}</p>
        <p style="margin:0 0 9px;font-size:14px;line-height:1.8;color:#4b4641;"><strong>Fizetési mód:</strong> ${paymentLabel}</p>
        <p style="margin:0;font-size:14px;line-height:1.8;color:#4b4641;"><strong>Szállítás:</strong> ${escapeHtml(deliveryLine)}</p>
      </div>
    </div>
  `;
};

export async function sendOrderEmails(order: OrderEmailInput) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_TO || process.env.GMAIL_USER;
  const customerEmail = order.customer_email;
  const orderId = order.id ?? 'ismeretlen';
  const customerDisplayName = getCustomerDisplayName(order);
  const customerHtml = renderEmailLayout({
    title: 'Köszönjük a megrendelést!',
    subtitle: 'Rendelés visszaigazolás',
    intro: `Szép napot! A ${BRAND_NAME} webshopban leadott rendelésedet rögzítettük. Itt a megrendelésed összefoglalója és a következő lépések.` ,
    bodyHtml: buildOrderConfirmationBody(order),
    footerNote: 'A banki átutalásról vagy a fizetésről további tájékoztatást küldünk e-mailben, ha szükséges.',
    ctaText: 'Megnézem a rendelést',
    ctaLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order-success?id=${encodeURIComponent(String(orderId))}`,
  });

  const customerText = [
    `Köszönjük a megrendelést!`,
    `Megrendelés azonosító: #${orderId}`,
    `Vevő: ${customerDisplayName}`,
    `Fizetési mód: ${order.payment_method === 'stripe' ? 'Online fizetés' : 'Banki átutalás'}`,
    `Szállítás: ${buildDeliveryText(order)}`,
    `Végösszeg: ${formatMoney(Number(order.total_price ?? 0))}`,
    'A rendelés feldolgozását követően értesítünk a további lépésekről.',
    `Üdvözlettel: ${BRAND_NAME}`,
  ].join('\n');

  const adminHtml = renderEmailLayout({
    title: 'Új megrendelés érkezett',
    subtitle: 'Admin értesítés',
    intro: `Új megrendelés érkezett a ${BRAND_NAME} webshopba. A részletek alább láthatók.`,
    bodyHtml: buildOrderConfirmationBody(order),
    footerNote: 'Ez az admin értesítés a webáruházból származó új rendeléshez készült.',
  });

  const recipients: Array<SendTransactionalEmailOptions> = [];

  if (customerEmail) {
    recipients.push({
      to: customerEmail,
      subject: `Rendelés visszaigazolás – ${BRAND_NAME}`,
      text: customerText,
      html: customerHtml,
      replyTo: BRAND_SUPPORT_EMAIL,
    });
  }

  if (adminEmail) {
    recipients.push({
      to: adminEmail,
      subject: `Új rendelés érkezett – #${orderId}`,
      text: `${customerText}\n\nA rendelést a weboldal admin felületén is ellenőrizhető.`,
      html: adminHtml,
      replyTo: BRAND_SUPPORT_EMAIL,
    });
  }

  if (!recipients.length) {
    return { sent: false, reason: 'no_recipients' };
  }

  const deliveryResults = await Promise.all(recipients.map(async (recipient) => sendTransactionalEmail(recipient)));

  return {
    sent: deliveryResults.some((result) => result.sent),
    count: deliveryResults.filter((result) => result.sent).length,
    results: deliveryResults,
  };
}

export async function sendOrderStatusEmail(order: OrderEmailInput, status: 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled' | 'refunded') {
  const customerEmail = order.customer_email;
  if (!customerEmail) {
    return { sent: false, reason: 'missing_customer_email' };
  }

  const statusMap: Record<string, { label: string; intro: string; subject: string }> = {
    pending: {
      label: 'Rendelésedet fogadtuk',
      intro: 'A rendelésedet rögzítettük és a feldolgozás megkezdődött. A további információkról e-mailben fogunk értesíteni.',
      subject: `Rendelésedet fogadtuk – ${BRAND_NAME}`,
    },
    paid: {
      label: 'A fizetés visszaigazolva',
      intro: 'A fizetésedet sikeresen ellenőriztük. A rendelésedet továbbítjuk a feldolgozásra.',
      subject: `A fizetés visszaigazolva – ${BRAND_NAME}`,
    },
    processing: {
      label: 'A rendelés feldolgozás alatt van',
      intro: 'A rendelésedet már feldolgozzuk. A következő frissítést hamarosan elküldjük e-mailben.',
      subject: `A rendelés feldolgozás alatt – ${BRAND_NAME}`,
    },
    shipped: {
      label: 'A rendelését kiszállításra került',
      intro: 'A csomagodat már kiszállításra készítettük. A nyomkövetési adatok és a kézbesítési információk hamarosan megérkeznek.',
      subject: `A rendelés kiszállításra került – ${BRAND_NAME}`,
    },
    completed: {
      label: 'A rendelés elkészült',
      intro: 'A megrendelésed elkészült és átadásra kerül. Köszönjük, hogy a Zsül Portékái webshopban vásároltál!',
      subject: `A rendelés elkészült – ${BRAND_NAME}`,
    },
    cancelled: {
      label: 'A rendelés törölve',
      intro: `A rendelésed törlésre került, vagy a fizetési folyamat megszakadt. Ha kérdésed van, írj nekünk a ${BRAND_SUPPORT_EMAIL} címre.`,
      subject: `Rendelés törölve – ${BRAND_NAME}`,
    },
    refunded: {
      label: 'A rendelés visszatérítve',
      intro: `A rendelésedhez tartozó összeget visszatérítettük. Ha kérdésed van, írj nekünk a ${BRAND_SUPPORT_EMAIL} címre.`,
      subject: `Rendelés visszatérítve – ${BRAND_NAME}`,
    },
  };

  const config = statusMap[status] ?? statusMap.pending;

  const html = renderEmailLayout({
    title: config.label,
    subtitle: 'Rendelés státusz',
    intro: config.intro,
    bodyHtml: buildOrderStatusBody(order, config.label, config.intro),
    ctaText: 'Rendelés megtekintése',
    ctaLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order-success?id=${encodeURIComponent(String(order.id ?? ''))}`,
    footerNote: 'Ha bármilyen kérdésed van, írj nekünk a támogatási e-mail címünkre.',
  });

  return sendTransactionalEmail({
    to: customerEmail,
    subject: config.subject,
    text: `${config.label}\n\n${config.intro}\n\nMegrendelés: #${order.id ?? 'ismeretlen'}\nVevő: ${getCustomerDisplayName(order)}`,
    html,
    replyTo: BRAND_SUPPORT_EMAIL,
  });
}

export async function sendCartAbandonmentEmail({
  to,
  customerName,
  items,
  cartUrl,
}: {
  to: string;
  customerName?: string;
  items?: Array<{ title?: string; price?: number; quantity?: number; image?: string }>;
  cartUrl?: string;
}) {
  const name = customerName?.trim() || 'kedves vásárló';
  const cartLink = cartUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout`;
  const itemRows = items && items.length ? items.map((item) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #efe5d8;color:#2d2922;font-size:14px;">${escapeHtml(item.title ?? 'Termék')}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #efe5d8;color:#2d2922;font-size:14px;text-align:center;">${Number(item.quantity ?? 1)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #efe5d8;color:#2d2922;font-size:14px;text-align:right;">${formatMoney(Number(item.price ?? 0) * Number(item.quantity ?? 1))}</td>
    </tr>
  `).join('') : '<tr><td colspan="3" style="padding:12px;color:#6a625d;">A kosár tartalma mentve, visszatéréshez kattints a gombra.</td></tr>';

  const html = renderEmailLayout({
    title: 'Hiányzik a kosarad?',
    subtitle: 'Kosár elhagyás',
    intro: `Szia ${escapeHtml(name)}! Úgy látjuk, hogy a kiválasztott termékeket a kosárban hagytad. Ha szeretnéd, itt folytathatod a rendelést gyorsan és egyszerűen.`,
    bodyHtml: `
      <div style="background:#faf7f3;border:1px solid #efe4d4;border-radius:16px;padding:18px;">
        <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#3d3935;">A következő termékek még a kosárban várnak rád:</p>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f6f0e8;">
              <th style="padding:12px 12px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:0.12em;color:#756d66;">Termék</th>
              <th style="padding:12px 12px;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:0.12em;color:#756d66;">Db</th>
              <th style="padding:12px 12px;text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:0.12em;color:#756d66;">Összeg</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
      </div>
    `,
    ctaText: 'Vissza a kosárhoz',
    ctaLink: cartLink,
    footerNote: 'Ha nem te kezdeményezted ezt az e-mailt, nyugodtan törölheted az üzenetet.',
  });

  return sendTransactionalEmail({
    to,
    subject: `A kosarad még vár rád – ${BRAND_NAME}`,
    text: `Szia ${name}! A kosárad még benne van, és gyorsan visszatérhetsz a rendeléshez. ${cartLink}`,
    html,
    replyTo: BRAND_SUPPORT_EMAIL,
  });
}

