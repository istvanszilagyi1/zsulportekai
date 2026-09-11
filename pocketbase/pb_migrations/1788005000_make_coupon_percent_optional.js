/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const couponsCollection = app.findCollectionByNameOrId('coupons');
  if (!couponsCollection) return;

  const discountPercentField = couponsCollection.fields.getByName('discount_percent');
  if (discountPercentField) {
    discountPercentField.required = false;
    app.save(couponsCollection);
  }
}, () => {});