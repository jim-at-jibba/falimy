/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");

    users.fields.add(
      new NumberField({
        name: "location_history_retention_days",
        min: 0,
        max: 365,
        noDecimal: true,
      }),
    );

    app.save(users);
  },
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    users.fields.removeByName("location_history_retention_days");
    app.save(users);
  },
);
