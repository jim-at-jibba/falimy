import { createTable, schemaMigrations } from "@nozbe/watermelondb/Schema/migrations";

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
  ],
});
