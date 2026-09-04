/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "max": 15,
        "min": 15,
        "name": "id",
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      { "name": "order_id", "type": "text", "required": true },
      { "name": "customer_name", "type": "text", "required": false },
      { "name": "recipient", "type": "email", "required": true },
      {
        "name": "type",
        "type": "select",
        "required": true,
        "maxSelect": 1,
        "values": ["customer", "admin", "invoice"]
      },
      { "name": "sent_at", "type": "date", "required": true },
      { "name": "subject", "type": "text", "required": true },
      { "name": "body", "type": "text", "required": false },
      { "name": "from_address", "type": "text", "required": false },
      { "name": "provider", "type": "text", "required": false },
      { "name": "dedupe_key", "type": "text", "required": false }
    ],
    "indexes": ["CREATE UNIQUE INDEX idx_email_logs_dedupe ON email_logs (dedupe_key) WHERE dedupe_key != ''"],
    "name": "email_logs",
    "type": "base",
    "listRule": null,
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId('email_logs');
  if (collection) return app.delete(collection);
});