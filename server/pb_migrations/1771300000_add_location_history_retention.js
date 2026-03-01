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

    // Set default retention to 30 days for all existing users
    const records = app.findAllRecords("users");
    for (const record of records) {
      record.set("location_history_retention_days", 30);
      app.save(record);
    }
  },
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    users.fields.removeByName("location_history_retention_days");
    app.save(users);
  },
);
