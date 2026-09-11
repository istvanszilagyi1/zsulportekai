/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const couponsCollection = app.findCollectionByNameOrId('pbc_coupons_01');
  if (!couponsCollection) return;

  if (!couponsCollection.fields.getByName('discount_amount')) {
    couponsCollection.fields.add(new NumberField({
      name: 'discount_amount',
      required: false,
      hidden: false,
      presentable: false,
      min: 0,
      max: 9999999999,
      onlyInt: false,
    }));
  }

  if (!couponsCollection.fields.getByName('product_id')) {
    couponsCollection.fields.add(new TextField({
      name: 'product_id',
      required: false,
      hidden: false,
      presentable: false,
      min: 0,
      max: 0,
    }));
  }

  if (!couponsCollection.fields.getByName('product_title')) {
    couponsCollection.fields.add(new TextField({
      name: 'product_title',
      required: false,
      hidden: false,
      presentable: false,
      min: 0,
      max: 0,
    }));
  }

  app.save(couponsCollection);
}, (app) => {
  // Fields are intentionally kept on rollback because earlier migrations may own them.
});