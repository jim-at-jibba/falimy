import { createTable, unsafeExecuteSql, schemaMigrations } from "@nozbe/watermelondb/Schema/migrations";

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        // WatermelonDB doesn't support renaming tables, so we create the new
        // tables with the correct names. The old shopping_lists / shopping_items
        // tables will be dropped automatically by WatermelonDB when they are no
        // longer in the schema. A full re-sync will repopulate the data.
        createTable({
          name: "lists",
          columns: [
            { name: "server_id", type: "string" },
            { name: "name", type: "string" },
            { name: "type", type: "string" },
            { name: "family_id", type: "string", isIndexed: true },
            { name: "assigned_to_id", type: "string", isOptional: true, isIndexed: true },
            { name: "status", type: "string" },
            { name: "sort_order", type: "number" },
            { name: "created_by_id", type: "string", isOptional: true },
            { name: "created_at", type: "number" },
            { name: "updated_at", type: "number" },
          ],
        }),
        createTable({
          name: "list_items",
          columns: [
            { name: "server_id", type: "string" },
            { name: "list_id", type: "string", isIndexed: true },
            { name: "name", type: "string" },
            { name: "quantity", type: "string", isOptional: true },
            { name: "note", type: "string", isOptional: true },
            { name: "is_checked", type: "boolean" },
            { name: "checked_by_id", type: "string", isOptional: true },
            { name: "sort_order", type: "number" },
            { name: "created_by_id", type: "string", isOptional: true },
            { name: "created_at", type: "number" },
            { name: "updated_at", type: "number" },
          ],
        }),
      ],
    },
    {
      toVersion: 3,
      steps: [
        unsafeExecuteSql("CREATE INDEX IF NOT EXISTS index_families_server_id ON families(server_id);"),
        unsafeExecuteSql("CREATE INDEX IF NOT EXISTS index_members_server_id ON members(server_id);"),
        unsafeExecuteSql("CREATE INDEX IF NOT EXISTS index_lists_server_id ON lists(server_id);"),
        unsafeExecuteSql("CREATE INDEX IF NOT EXISTS index_list_items_server_id ON list_items(server_id);"),
        unsafeExecuteSql("CREATE INDEX IF NOT EXISTS index_location_history_server_id ON location_history(server_id);"),
        unsafeExecuteSql("CREATE INDEX IF NOT EXISTS index_geofences_server_id ON geofences(server_id);"),
      ],
    },
    {
      toVersion: 4,
      steps: [
        createTable({
          name: "recipes",
          columns: [
            { name: "server_id", type: "string", isIndexed: true },
            { name: "title", type: "string" },
            { name: "description", type: "string", isOptional: true },
            { name: "image", type: "string", isOptional: true },
            { name: "ingredients", type: "string" },
            { name: "steps", type: "string" },
            { name: "prep_time", type: "number", isOptional: true },
            { name: "cook_time", type: "number", isOptional: true },
            { name: "total_time", type: "number", isOptional: true },
            { name: "servings", type: "string", isOptional: true },
            { name: "source_url", type: "string", isOptional: true },
            { name: "notes", type: "string", isOptional: true },
            { name: "tags", type: "string", isOptional: true },
            { name: "family_id", type: "string", isIndexed: true },
            { name: "created_by_id", type: "string", isOptional: true },
            { name: "created_at", type: "number" },
            { name: "updated_at", type: "number" },
          ],
        }),
        unsafeExecuteSql("CREATE INDEX IF NOT EXISTS index_recipes_server_id ON recipes(server_id);"),
      ],
    },
    {
      toVersion: 5,
      steps: [
        unsafeExecuteSql("ALTER TABLE members ADD COLUMN location_history_retention_days NUMBER;"),
      ],
    },
  ],
});
