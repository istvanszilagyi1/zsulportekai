/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = new Collection({
    createRule: null,
    deleteRule: null,
    fields: [
      {
        autogeneratePattern: "[a-z0-9]{15}",
        max: 15,
        min: 15,
        name: "id",
        primaryKey: true,
        required: true,
        system: true,
        type: "text",
      },
      { name: "name", type: "text", required: true },
      {
        name: "category",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["market", "reseller"],
      },
      { name: "address", type: "text", required: true },
      { name: "description", type: "text", required: false },
      { name: "schedule", type: "text", required: false },
      { name: "active", type: "bool", required: false },
      { name: "sort_order", type: "number", required: false },
    ],
    indexes: [],
    listRule: "",
    name: "locations",
    type: "base",
    viewRule: "",
    updateRule: null,
  });

  app.save(collection);

  const locations = [
    {
      name: "Debrecen – Liget tér",
      category: "market",
      address: "Debrecen, Liget tér",
      description: "Piaci jelenlét és személyes vásárlási lehetőség.",
      schedule: "Minden hónap első szombatján, 8:00–11:30",
      active: true,
      sort_order: 1,
    },
    {
      name: "Debrecen – Kerekestelep",
      category: "market",
      address: "Debrecen, Kerekestelep, a Platán hotel melletti játszótér",
      description: "A Platán hotel melletti játszótérnél találkozhatsz velünk.",
      schedule: "Minden hónap első szombatján, 8:00–11:30",
      active: true,
      sort_order: 2,
    },
    {
      name: "Hajdúböszörmény – Ady téri piac",
      category: "market",
      address: "Hajdúböszörmény, Ady tér",
      description: "Ady téri piac.",
      schedule: "Minden hónap második péntekjén, 7:00–11:00",
      active: true,
      sort_order: 3,
    },
    {
      name: "Debrecen – Derce pékműhely udvara",
      category: "market",
      address: "Debrecen, Ruyter utca, Derce pékműhely udvara",
      description: "Termelői vásár a Derce pékműhely udvarán.",
      schedule: "Minden hónap második szombatján, 8:00–11:30",
      active: true,
      sort_order: 4,
    },
    {
      name: "Hajdúböszörmény – Fürdőkerti vásár",
      category: "market",
      address: "Hajdúböszörmény, Bíró Péter utca",
      description: "Fürdőkerti vásár.",
      schedule: "Minden hónap második szombatján, 7:00–12:00",
      active: true,
      sort_order: 5,
    },
    {
      name: "Újfehértó – Zsindelyes Cottage",
      category: "market",
      address: "Újfehértó, Zsindelyes Cottage termelői piac",
      description: "Termelői piac a Zsindelyes Cottage területén.",
      schedule: "Minden hónap második szombatján, 8:00–11:30",
      active: true,
      sort_order: 6,
    },
    {
      name: "Debrecen – Egyháztáji vásár",
      category: "market",
      address: "Debrecen, Leány utca 2",
      description: "Egyháztáji vásár.",
      schedule: "Minden hónap harmadik szombatján, 8:00–11:30",
      active: true,
      sort_order: 7,
    },
    {
      name: "Balmazújvárosi piac",
      category: "market",
      address: "Balmazújváros, piac",
      description: "Piaci jelenlét és személyes vásárlási lehetőség.",
      schedule: "Minden vasárnap, 7:00–11:00",
      active: true,
      sort_order: 8,
    },
    {
      name: "Csuporka bolt",
      category: "reseller",
      address: "Hajdúböszörmény, Petőfi Sándor utca 15.",
      description: "Viszonteladó partnerünk.",
      schedule: "",
      active: true,
      sort_order: 1,
    },
    {
      name: "Kálvin téri zöldséges bolt",
      category: "reseller",
      address: "Hajdúböszörmény, Kálvin tér 20.",
      description: "Viszonteladó partnerünk.",
      schedule: "",
      active: true,
      sort_order: 2,
    },
    {
      name: "Mosolygó zöldség-gyümölcs",
      category: "reseller",
      address: "Hajdúböszörmény, Külső-Hadházi utca 19.",
      description: "Viszonteladó partnerünk.",
      schedule: "",
      active: true,
      sort_order: 3,
    },
    {
      name: "Józsai piac – Tóth Józsefné",
      category: "reseller",
      address: "Józsai piac",
      description: "Viszonteladó partnerünk.",
      schedule: "Kedd, csütörtök, péntek",
      active: true,
      sort_order: 4,
    },
    {
      name: "Hajdúhadház piac – Tóth Józsefné",
      category: "reseller",
      address: "Hajdúhadház piac",
      description: "Viszonteladó partnerünk.",
      schedule: "Szombatonként",
      active: true,
      sort_order: 5,
    },
    {
      name: "Egyháztáji Delikátesz",
      category: "reseller",
      address: "Debrecen, Hatvan utca 1/A.",
      description: "Viszonteladó partnerünk.",
      schedule: "",
      active: true,
      sort_order: 6,
    },
  ];

  locations.forEach((data) => {
    const record = new Record(collection);
    Object.entries(data).forEach(([field, value]) => record.set(field, value));
    app.save(record);
  });
}, (app) => {
  const collection = app.findCollectionByNameOrId("locations");
  if (collection) return app.delete(collection);
});
