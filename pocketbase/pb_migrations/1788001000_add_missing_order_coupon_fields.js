/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const ordersCollection = app.findCollectionByNameOrId('pbc_3527180448');
  if (ordersCollection) {
    const ensureOrderField = (fieldConfig) => {
      const exists = ordersCollection.fields.some((field) => field.name === fieldConfig.name);
      if (!exists) {
        ordersCollection.fields.push(fieldConfig);
      }
    };

    ensureOrderField({
      "autogeneratePattern": "",
      "hidden": false,
      "id": "select407885657",
      "maxSelect": 0,
      "name": "payment_method",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "select",
      "values": ["bank_transfer", "stripe"]
    });

    ensureOrderField({
      "autogeneratePattern": "",
      "hidden": false,
      "id": "select434408116",
      "maxSelect": 0,
      "name": "payment_status",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "select",
      "values": ["pending", "paid", "refunded"]
    });

    ensureOrderField({
      "autogeneratePattern": "",
      "hidden": false,
      "id": "select337584382",
      "maxSelect": 0,
      "name": "status",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "select",
      "values": ["pending", "paid", "processing", "completed", "cancelled", "refunded"]
    });

    ensureOrderField({
      "hidden": false,
      "id": "number89422053",
      "max": 0,
      "min": 0,
      "name": "total_price",
      "onlyInt": false,
      "presentable": false,
      "required": false,
      "system": false,
      "type": "number"
    });

    ensureOrderField({
      "hidden": false,
      "id": "json2062985226",
      "name": "items",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "json"
    });

    ensureOrderField({
      "hidden": false,
      "id": "bool742384372",
      "name": "invoice_required",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "bool",
      "default": false
    });

    ensureOrderField({
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text1946655255",
      "max": 0,
      "min": 0,
      "name": "invoice_company_name",
      "pattern": "",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "text"
    });

    ensureOrderField({
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text2719392025",
      "max": 0,
      "min": 0,
      "name": "invoice_tax_number",
      "pattern": "",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "text"
    });

    ensureOrderField({
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text1033915616",
      "max": 0,
      "min": 0,
      "name": "invoice_address",
      "pattern": "",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "text"
    });

    ensureOrderField({
      "exceptDomains": [],
      "hidden": false,
      "id": "email912307455",
      "name": "invoice_email",
      "onlyDomains": [],
      "presentable": false,
      "required": false,
      "system": false,
      "type": "email"
    });

    ensureOrderField({
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text2739059261",
      "max": 0,
      "min": 0,
      "name": "coupon_code",
      "pattern": "",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "text"
    });

    ensureOrderField({
      "hidden": false,
      "id": "number2787160294",
      "max": 100,
      "min": 0,
      "name": "coupon_discount_percent",
      "onlyInt": false,
      "presentable": false,
      "required": false,
      "system": false,
      "type": "number"
    });

    ensureOrderField({
      "hidden": false,
      "id": "number1222083329",
      "max": 0,
      "min": 0,
      "name": "coupon_discount_amount",
      "onlyInt": false,
      "presentable": false,
      "required": false,
      "system": false,
      "type": "number"
    });

    ensureOrderField({
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text1418745304",
      "max": 0,
      "min": 0,
      "name": "coupon_product_id",
      "pattern": "",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "text"
    });

    ensureOrderField({
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text1705568274",
      "max": 0,
      "min": 0,
      "name": "coupon_product_title",
      "pattern": "",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "text"
    });

    ensureOrderField({
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text1676863109",
      "max": 0,
      "min": 0,
      "name": "stripe_session_id",
      "pattern": "",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "text"
    });

    app.save(ordersCollection);
  }

  const couponsCollection = app.findCollectionByNameOrId('pbc_coupons_01');
  if (couponsCollection) {
    const ensureCouponField = (fieldConfig) => {
      const exists = couponsCollection.fields.some((field) => field.name === fieldConfig.name);
      if (!exists) {
        couponsCollection.fields.push(fieldConfig);
      }
    };

    ensureCouponField({
      "hidden": false,
      "id": "number842197335",
      "max": 0,
      "min": 0,
      "name": "discount_amount",
      "onlyInt": false,
      "presentable": false,
      "required": false,
      "system": false,
      "type": "number"
    });

    ensureCouponField({
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text437981319",
      "max": 0,
      "min": 0,
      "name": "product_id",
      "pattern": "",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "text"
    });

    ensureCouponField({
      "autogeneratePattern": "",
      "hidden": false,
      "id": "text3122710902",
      "max": 0,
      "min": 0,
      "name": "product_title",
      "pattern": "",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "text"
    });

    app.save(couponsCollection);
  }
}, (app) => {
  // No-op rollback: keeping the migration idempotent and safe for retry.
});
