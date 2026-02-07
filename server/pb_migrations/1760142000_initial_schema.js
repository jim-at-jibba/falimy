migrate(
  (app) => {
    const families = new Collection({
      type: "base",
      name: "families",
      listRule: "@request.auth.id != '' && id = @request.auth.family_id",
      viewRule: "@request.auth.id != '' && id = @request.auth.family_id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && id = @request.auth.family_id && @request.auth.role = 'admin'",
      deleteRule: "@request.auth.id != '' && id = @request.auth.family_id && @request.auth.role = 'admin'",
      fields: [
        { name: "name", type: "text", required: true },
        { name: "invite_code", type: "text", required: true },
        { name: "ntfy_topic_prefix", type: "text", required: true },
        {
          name: "created_by",
          type: "relation",
          required: true,
          maxSelect: 1,
          collectionId: "_pb_users_auth_",
        },
      ],
    });
    app.save(families);

    const users = app.findCollectionByNameOrId("users");
    users.listRule = "@request.auth.id != ''";
    users.viewRule = "@request.auth.id != ''";
    users.updateRule = "@request.auth.id = id";
    users.deleteRule = "@request.auth.id = id";

    users.fields.add(
      new TextField({
        name: "name",
      }),
    );
    users.fields.add(
      new FileField({
        name: "avatar",
        maxSelect: 1,
      }),
    );
    users.fields.add(
      new SelectField({
        name: "role",
        required: true,
        maxSelect: 1,
        values: ["admin", "member", "child"],
      }),
    );
    users.fields.add(
      new RelationField({
        name: "family_id",
        collectionId: "families",
        maxSelect: 1,
      }),
    );
    users.fields.add(
      new SelectField({
        name: "location_sharing_mode",
        maxSelect: 1,
        values: ["off", "always", "timed", "on_request"],
      }),
    );
    users.fields.add(
      new DateField({
        name: "location_sharing_until",
      }),
    );
    users.fields.add(
      new NumberField({
        name: "last_lat",
      }),
    );
    users.fields.add(
      new NumberField({
        name: "last_lng",
      }),
    );
    users.fields.add(
      new DateField({
        name: "last_location_at",
      }),
    );

    app.save(users);

    const shoppingLists = new Collection({
      type: "base",
      name: "shopping_lists",
      listRule: "@request.auth.id != '' && family_id = @request.auth.family_id",
      viewRule: "@request.auth.id != '' && family_id = @request.auth.family_id",
      createRule: "@request.auth.id != '' && family_id = @request.auth.family_id",
      updateRule: "@request.auth.id != '' && family_id = @request.auth.family_id",
      deleteRule: "@request.auth.id != '' && family_id = @request.auth.family_id",
      fields: [
        { name: "name", type: "text", required: true },
        {
          name: "family_id",
          type: "relation",
          required: true,
          maxSelect: 1,
          collectionId: "families",
        },
        {
          name: "assigned_to",
          type: "relation",
          maxSelect: 1,
          collectionId: "_pb_users_auth_",
        },
        {
          name: "status",
          type: "select",
          maxSelect: 1,
          values: ["active", "completed", "archived"],
        },
        { name: "sort_order", type: "number" },
        {
          name: "created_by",
          type: "relation",
          maxSelect: 1,
          collectionId: "_pb_users_auth_",
        },
      ],
    });
    app.save(shoppingLists);

    const shoppingItems = new Collection({
      type: "base",
      name: "shopping_items",
      listRule: "@request.auth.id != '' && list_id.family_id = @request.auth.family_id",
      viewRule: "@request.auth.id != '' && list_id.family_id = @request.auth.family_id",
      createRule: "@request.auth.id != '' && list_id.family_id = @request.auth.family_id",
      updateRule: "@request.auth.id != '' && list_id.family_id = @request.auth.family_id",
      deleteRule: "@request.auth.id != '' && list_id.family_id = @request.auth.family_id",
      fields: [
        {
          name: "list_id",
          type: "relation",
          required: true,
          maxSelect: 1,
          collectionId: "shopping_lists",
          cascadeDelete: true,
        },
        { name: "name", type: "text", required: true },
        { name: "quantity", type: "text" },
        { name: "note", type: "text" },
        { name: "checked", type: "bool" },
        {
          name: "checked_by",
          type: "relation",
          maxSelect: 1,
          collectionId: "_pb_users_auth_",
        },
        { name: "sort_order", type: "number" },
        {
          name: "created_by",
          type: "relation",
          maxSelect: 1,
          collectionId: "_pb_users_auth_",
        },
      ],
    });
    app.save(shoppingItems);

    const locationHistory = new Collection({
      type: "base",
      name: "location_history",
      listRule: "@request.auth.id != '' && user_id.family_id = @request.auth.family_id",
      viewRule: "@request.auth.id != '' && user_id.family_id = @request.auth.family_id",
      createRule: "@request.auth.id != '' && user_id = @request.auth.id",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: "user_id",
          type: "relation",
          required: true,
          maxSelect: 1,
          collectionId: "_pb_users_auth_",
        },
        { name: "lat", type: "number" },
        { name: "lng", type: "number" },
        { name: "accuracy", type: "number" },
        { name: "battery_level", type: "number" },
        { name: "timestamp", type: "date" },
      ],
    });
    app.save(locationHistory);

    const geofences = new Collection({
      type: "base",
      name: "geofences",
      listRule: "@request.auth.id != '' && family_id = @request.auth.family_id",
      viewRule: "@request.auth.id != '' && family_id = @request.auth.family_id",
      createRule: "@request.auth.id != '' && family_id = @request.auth.family_id",
      updateRule: "@request.auth.id != '' && family_id = @request.auth.family_id",
      deleteRule: "@request.auth.id != '' && family_id = @request.auth.family_id",
      fields: [
        {
          name: "family_id",
          type: "relation",
          required: true,
          maxSelect: 1,
          collectionId: "families",
        },
        { name: "name", type: "text", required: true },
        { name: "lat", type: "number" },
        { name: "lng", type: "number" },
        { name: "radius", type: "number" },
        {
          name: "notify_user_id",
          type: "relation",
          maxSelect: 1,
          collectionId: "_pb_users_auth_",
        },
        {
          name: "watch_user_id",
          type: "relation",
          maxSelect: 1,
          collectionId: "_pb_users_auth_",
        },
        {
          name: "trigger_on",
          type: "select",
          maxSelect: 1,
          values: ["enter", "exit", "both"],
        },
        { name: "enabled", type: "bool" },
      ],
    });
    app.save(geofences);
  },
  (app) => {
    const collectionNames = [
      "geofences",
      "location_history",
      "shopping_items",
      "shopping_lists",
      "families",
    ];

    for (const name of collectionNames) {
      try {
        const collection = app.findCollectionByNameOrId(name);
        app.delete(collection);
      } catch {
        // ignore missing collection
      }
    }

    try {
      const users = app.findCollectionByNameOrId("users");
      users.fields.removeByName("name");
      users.fields.removeByName("avatar");
      users.fields.removeByName("role");
      users.fields.removeByName("family_id");
      users.fields.removeByName("location_sharing_mode");
      users.fields.removeByName("location_sharing_until");
      users.fields.removeByName("last_lat");
      users.fields.removeByName("last_lng");
      users.fields.removeByName("last_location_at");

      users.listRule = null;
      users.viewRule = null;
      users.updateRule = null;
      users.deleteRule = null;

      app.save(users);
    } catch {
      // ignore if users collection missing
    }
  },
);
