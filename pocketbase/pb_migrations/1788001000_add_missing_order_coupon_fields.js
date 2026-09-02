/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const ordersCollection = app.findCollectionByNameOrId('pbc_3527180448');
  if (ordersCollection) {
    const ensureOrderField = (config) => {
      const exists = ordersCollection.fields.some((field) => field.name === config.name);
      if (!exists) {
        ordersCollection.fields.push(config);
      }
    };

    ensureOrderField({
      "system": false,
      "id": "select407885657",
      "name": "payment_method",
      "type": "select",
      "required": false,
      "presentable": false,
      "hidden": false,
      "maxSelect": 1,
      "values": ["bank_transfer", "stripe"]
    });

    ensureOrderField({
      "system": false,
      "id": "select434408116",
      "name": "payment_status",
      "type": "select",
      "required": false,
      "presentable": false,
      "hidden": false,
      "maxSelect": 1,
      "values": ["pending", "paid", "refunded"]
    });

    ensureOrderField({
      "system": false,
      "id": "select337584382",
      "name": "status",
      "type": "select",
      "required": false,
      "presentable": false,
      "hidden": false,
      "maxSelect": 1,
      "values": ["pending", "paid", "processing", "completed", "cancelled", "refunded"]
    });

    ensureOrderField({
      "system": false,
      "id": "number89422053",
      "name": "total_price",
      "type": "number",
      "required": false,
      "presentable": false,
      "hidden": false,
      "min": 0,
      "max": 0,
      "onlyInt": false
    });

    ensureOrderField({
      "system": false,
      "id": "json2062985226",
      "name": "items",
      "type": "json",
      "required": false,
      "presentable": false,
      "hidden": false,
      "maxSize": 0,
      "minSize": 0
    });

    ensureOrderField({
      "system": false,
      "id": "bool742384372",
      "name": "invoice_required",
      "type": "bool",
      "required": false,
      "presentable": false,
      "hidden": false,
      "default": false
    });

    ensureOrderField({
      "system": false,
      "id": "text1946655255",
      "name": "invoice_company_name",
      "type": "text",
      "required": false,
      "presentable": false,
      "hidden": false,
      "min": 0,
      "max": 0,
      "pattern": ""
    });

    ensureOrderField({
      "system": false,
      "id": "text2719392025",
      "name": "invoice_tax_number",
      "type": "text",
      "required": false,
      "presentable": false,
      "hidden": false,
      "min": 0,
      "max": 0,
      "pattern": ""
    });

    ensureOrderField({
      "system": false,
      "id": "text1033915616",
      "name": "invoice_address",
      "type": "text",
      "required": false,
      "presentable": false,
      "hidden": false,
      "min": 0,
      "max": 0,
      "pattern": ""
    });

    ensureOrderField({
      "system": false,
      "id": "email912307455",
      "name": "invoice_email",
      "type": "email",
      "required": false,
      "presentable": false,
      "hidden": false,
      "exceptDomains": [],
      "onlyDomains": []
    });

    ensureOrderField({
      "system": false,
      "id": "text2739059261",
      "name": "coupon_code",
      "type": "text",
      "required": false,
      "presentable": false,
      "hidden": false,
      "min": 0,
      "max": 0,
      "pattern": ""
    });

    ensureOrderField({
      "system": false,
      "id": "number2787160294",
      "name": "coupon_discount_percent",
      "type": "number",
      "required": false,
      "presentable": false,
      "hidden": false,
      "min": 0,
      "max": 100,
      "onlyInt": false
    });

    ensureOrderField({
      "system": false,
      "id": "number1222083329",
      "name": "coupon_discount_amount",
      "type": "number",
      "required": false,
      "presentable": false,
      "hidden": false,
      "min": 0,
      "max": 0,
      "onlyInt": false
    });

    ensureOrderField({
      "system": false,
      "id": "text1418745304",
      "name": "coupon_product_id",
      "type": "text",
      "required": false,
      "presentable": false,
      "hidden": false,
      "min": 0,
      "max": 0,
      "pattern": ""
    });

    ensureOrderField({
      "system": false,
      "id": "text1705568274",
      "name": "coupon_product_title",
      "type": "text",
      "required": false,
      "presentable": false,
      "hidden": false,
      "min": 0,
      "max": 0,
      "pattern": ""
    });

    ensureOrderField({
      "system": false,
      "id": "text1676863109",
      "name": "stripe_session_id",
      "type": "text",
      "required": false,
      "presentable": false,
      "hidden": false,
      "min": 0,
      "max": 0,
      "pattern": ""
    });

    app.save(ordersCollection);
  }

  const couponsCollection = app.findCollectionByNameOrId('pbc_coupons_01');
  if (couponsCollection) {
    const ensureCouponField = (config) => {
      const exists = couponsCollection.fields.some((field) => field.name === config.name);
      if (!exists) {
        couponsCollection.fields.push(config);
      }
    };

    ensureCouponField({
      "system": false,
      "id": "number842197335",
      "name": "discount_amount",
      "type": "number",
      "required": false,
      "presentable": false,
      "hidden": false,
      "min": 0,
      "max": 0,
      "onlyInt": false
    });

    ensureCouponField({
      "system": false,
      "id": "text437981319",
      "name": "product_id",
      "type": "text",
      "required": false,
      "presentable": false,
      "hidden": false,
      "min": 0,
      "max": 0,
      "pattern": ""
    });

    ensureCouponField({
      "system": false,
      "id": "text3122710902",
      "name": "product_title",
      "type": "text",
      "required": false,
      "presentable": false,
      "hidden": false,
      "min": 0,
      "max": 0,
      "pattern": ""
    });

    app.save(couponsCollection);
  }
}, (app) => {
  const ordersCollection = app.findCollectionByNameOrId('pbc_3527180448');
  if (ordersCollection) {
    const orderFields = [
      'payment_method',
      'payment_status',
      'status',
      'total_price',
      'items',
      'invoice_required',
      'invoice_company_name',
      'invoice_tax_number',
      'invoice_address',
      'invoice_email',
      'coupon_code',
      'coupon_discount_percent',
      'coupon_discount_amount',
      'coupon_product_id',
      'coupon_product_title',
      'stripe_session_id'
    ];

    ordersCollection.fields = ordersCollection.fields.filter((field) => !orderFields.includes(field.name));
    app.save(ordersCollection);
  }

  const couponsCollection = app.findCollectionByNameOrId('pbc_coupons_01');
  if (couponsCollection) {
    const couponFields = ['discount_amount', 'product_id', 'product_title'];
    couponsCollection.fields = couponsCollection.fields.filter((field) => !couponFields.includes(field.name));
    app.save(couponsCollection);
  }
});
