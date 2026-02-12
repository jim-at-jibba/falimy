/// <reference path="../pb_data/types.d.ts" />

// Rename shopping_lists -> lists, shopping_items -> list_items.
// Add "type" select field to lists collection.
migrate(
  (app) => {
    // --- Rename shopping_lists to lists ---
    const lists = app.findCollectionByNameOrId("shopping_lists");
    lists.name = "lists";

    // Add type field (shopping, todo, packing, custom)
    lists.fields.add(
      new SelectField({
        name: "type",
        required: true,
        maxSelect: 1,
        values: ["shopping", "todo", "packing", "custom"],
      }),
    );

    // Update API rules to use new name references if needed
    // (the rules reference field names, not collection names, so they stay the same)
    app.save(lists);

    // --- Rename shopping_items to list_items ---
    const items = app.findCollectionByNameOrId("shopping_items");
    items.name = "list_items";

    // Update the list_id relation to point to the renamed collection
    // (PocketBase tracks relations by collectionId, not name, so this is automatic)
    app.save(items);
  },
  (app) => {
    // Revert: rename back
    const lists = app.findCollectionByNameOrId("lists");
    lists.name = "shopping_lists";
    lists.fields.removeByName("type");
    app.save(lists);

    const items = app.findCollectionByNameOrId("list_items");
    items.name = "shopping_items";
    app.save(items);
  },
);
