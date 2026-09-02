/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const productsCollection = app.findCollectionByNameOrId('pbc_4092854851') ?? app.findCollectionByNameOrId('products');

  if (!productsCollection) {
    return;
  }

  const ensureProductField = (field) => {
    if (!productsCollection.fields.getByName(field.name)) {
      productsCollection.fields.add(field);
    }
  };

  ensureProductField(new NumberField({
    name: 'sale_price',
    required: false,
    hidden: false,
    presentable: false,
    min: 0,
    max: 9999999999,
    onlyInt: false,
  }));

  ensureProductField(new BoolField({
    name: 'is_out_of_stock',
    required: false,
    hidden: false,
    presentable: false,
    default: false,
  }));

  app.save(productsCollection);
}, (app) => {
  const productsCollection = app.findCollectionByNameOrId('pbc_4092854851') ?? app.findCollectionByNameOrId('products');

  if (!productsCollection) {
    return;
  }

  const removeIfExists = (fieldName) => {
    const field = productsCollection.fields.getByName(fieldName);
    if (field) {
      productsCollection.fields.remove(field);
    }
  };

  removeIfExists('sale_price');
  removeIfExists('is_out_of_stock');

  app.save(productsCollection);
});
