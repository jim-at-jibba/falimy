/// <reference path="../pb_data/types.d.ts" />

// Add created/updated autodate fields to all base collections.
// PocketBase v0.23+ does NOT auto-generate these for base collections
// created via `new Collection()` — they must be defined explicitly.
migrate(
  (app) => {
    const baseCollections = [
      "families",
      "shopping_lists",
      "shopping_items",
      "location_history",
      "geofences",
    ];

    for (const name of baseCollections) {
      const collection = app.findCollectionByNameOrId(name);

      // Only add if not already present
      if (!collection.fields.getByName("created")) {
        collection.fields.add(
          new AutodateField({
            name: "created",
            onCreate: true,
            onUpdate: false,
          }),
        );
      }

      if (!collection.fields.getByName("updated")) {
        collection.fields.add(
          new AutodateField({
            name: "updated",
            onCreate: true,
            onUpdate: true,
          }),
        );
      }

      app.save(collection);
    }
  },
  (app) => {
    const baseCollections = [
      "families",
      "shopping_lists",
      "shopping_items",
      "location_history",
      "geofences",
    ];

    for (const name of baseCollections) {
      try {
        const collection = app.findCollectionByNameOrId(name);
        collection.fields.removeByName("created");
        collection.fields.removeByName("updated");
        app.save(collection);
      } catch {
        // ignore
      }
    }
  },
);
