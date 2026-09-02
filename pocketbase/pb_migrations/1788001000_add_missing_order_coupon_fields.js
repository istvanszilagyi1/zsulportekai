/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const ordersCollection = app.findCollectionByNameOrId('pbc_3527180448');
  if (ordersCollection) {
    const ensureOrderField = (field) => {
      if (!ordersCollection.fields.getByName(field.name)) {
        ordersCollection.fields.add(field);
      }
    };

    ensureOrderField(new SelectField({
      name: 'payment_method',
      required: false,
      hidden: false,
      presentable: false,
      maxSelect: 0,
      values: ['bank_transfer', 'stripe']
    }));

    ensureOrderField(new SelectField({
      name: 'payment_status',
      required: false,
      hidden: false,
      presentable: false,
      maxSelect: 0,
      values: ['pending', 'paid', 'refunded']
    }));

    ensureOrderField(new SelectField({
      name: 'status',
      required: false,
      hidden: false,
      presentable: false,
      maxSelect: 0,
      values: ['pending', 'paid', 'processing', 'completed', 'cancelled', 'refunded']
    }));

    ensureOrderField(new NumberField({
      name: 'total_price',
      required: false,
      hidden: false,
      presentable: false,
      min: 0,
      max: 0,
      onlyInt: false
    }));

    ensureOrderField(new JsonField({
      name: 'items',
      required: false,
      hidden: false,
      presentable: false
    }));

    ensureOrderField(new BoolField({
      name: 'invoice_required',
      required: false,
      hidden: false,
      presentable: false,
      default: false
    }));

    ensureOrderField(new TextField({
      name: 'invoice_company_name',
      required: false,
      hidden: false,
      presentable: false,
      min: 0,
      max: 0
    }));

    ensureOrderField(new TextField({
      name: 'invoice_tax_number',
      required: false,
      hidden: false,
      presentable: false,
      min: 0,
      max: 0
    }));

    ensureOrderField(new TextField({
      name: 'invoice_address',
      required: false,
      hidden: false,
      presentable: false,
      min: 0,
      max: 0
    }));

    ensureOrderField(new EmailField({
      name: 'invoice_email',
      required: false,
      hidden: false,
      presentable: false,
      onlyDomains: [],
      exceptDomains: []
    }));

    ensureOrderField(new TextField({
      name: 'coupon_code',
      required: false,
      hidden: false,
      presentable: false,
      min: 0,
      max: 0
    }));

    ensureOrderField(new NumberField({
      name: 'coupon_discount_percent',
      required: false,
      hidden: false,
      presentable: false,
      min: 0,
      max: 100,
      onlyInt: false
    }));

    ensureOrderField(new NumberField({
      name: 'coupon_discount_amount',
      required: false,
      hidden: false,
      presentable: false,
      min: 0,
      max: 0,
      onlyInt: false
    }));

    ensureOrderField(new TextField({
      name: 'coupon_product_id',
      required: false,
      hidden: false,
      presentable: false,
      min: 0,
      max: 0
    }));

    ensureOrderField(new TextField({
      name: 'coupon_product_title',
      required: false,
      hidden: false,
      presentable: false,
      min: 0,
      max: 0
    }));

    ensureOrderField(new TextField({
      name: 'stripe_session_id',
      required: false,
      hidden: false,
      presentable: false,
      min: 0,
      max: 0
    }));

    app.save(ordersCollection);
  }

  const couponsCollection = app.findCollectionByNameOrId('pbc_coupons_01');
  if (couponsCollection) {
    const ensureCouponField = (field) => {
      if (!couponsCollection.fields.getByName(field.name)) {
        couponsCollection.fields.add(field);
      }
    };

    ensureCouponField(new NumberField({
      name: 'discount_amount',
      required: false,
      hidden: false,
      presentable: false,
      min: 0,
      max: 0,
      onlyInt: false
    }));

    ensureCouponField(new TextField({
      name: 'product_id',
      required: false,
      hidden: false,
      presentable: false,
      min: 0,
      max: 0
    }));

    ensureCouponField(new TextField({
      name: 'product_title',
      required: false,
      hidden: false,
      presentable: false,
      min: 0,
      max: 0
    }));

    app.save(couponsCollection);
  }
}, (app) => {
  // No-op rollback: keeping the migration idempotent and safe for retry.
});
