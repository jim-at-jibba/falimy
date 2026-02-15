/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    const families = app.findCollectionByNameOrId("families");

    const recipes = new Collection({
      type: "base",
      name: "recipes",
      listRule: "@request.auth.id != '' && family_id = @request.auth.family_id",
      viewRule: "@request.auth.id != '' && family_id = @request.auth.family_id",
      createRule: "@request.auth.id != '' && family_id = @request.auth.family_id",
      updateRule: "@request.auth.id != '' && family_id = @request.auth.family_id",
      deleteRule: "@request.auth.id != '' && family_id = @request.auth.family_id",
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
          options: { min: 1, max: 500 },
        },
        {
          name: "description",
          type: "text",
          options: { max: 2000 },
        },
        {
          name: "image",
          type: "file",
          maxSelect: 1,
          maxSize: 5242880,
        },
        {
          name: "ingredients",
          type: "json",
          required: true,
        },
        {
          name: "steps",
          type: "json",
          required: true,
        },
        {
          name: "prep_time",
          type: "number",
          options: { min: 0, max: 10080, noDecimal: true },
        },
        {
          name: "cook_time",
          type: "number",
          options: { min: 0, max: 10080, noDecimal: true },
        },
        {
          name: "total_time",
          type: "number",
          options: { min: 0, max: 10080, noDecimal: true },
        },
        {
          name: "servings",
          type: "text",
          options: { max: 100 },
        },
        {
          name: "source_url",
          type: "url",
          options: { max: 2000 },
        },
        {
          name: "notes",
          type: "text",
          options: { max: 5000 },
        },
        {
          name: "tags",
          type: "json",
        },
        {
          name: "family_id",
          type: "relation",
          required: true,
          maxSelect: 1,
          collectionId: families.id,
        },
        {
          name: "created_by",
          type: "relation",
          required: true,
          maxSelect: 1,
          collectionId: "_pb_users_auth_",
        },
        {
          name: "created",
          type: "autodate",
          onCreate: true,
          onUpdate: false,
        },
        {
          name: "updated",
          type: "autodate",
          onCreate: true,
          onUpdate: true,
        },
      ],
    });
    app.save(recipes);
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId("recipes");
      app.delete(collection);
    } catch {
      // ignore missing collection
    }
  },
);
