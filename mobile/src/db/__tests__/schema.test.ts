import { schema } from "../schema";

describe("Database Schema", () => {
  describe("Schema structure", () => {
    it("should have version 3", () => {
      expect(schema.version).toBe(3);
    });

    it("should have 6 tables", () => {
      expect(schema.tables).toHaveLength(6);
    });
  });

  describe("Table existence", () => {
    const expectedTables = ["families", "members", "lists", "list_items", "location_history", "geofences"];

    expectedTables.forEach((tableName) => {
      it(`should have table "${tableName}"`, () => {
        const table = schema.tables.find((t: any) => t.name === tableName);
        expect(table).toBeDefined();
        expect(table.name).toBe(tableName);
      });
    });
  });

  describe("Common columns across all tables", () => {
    const allTables = ["families", "members", "lists", "list_items", "location_history", "geofences"];

    it("each table should have server_id column", () => {
      allTables.forEach((tableName) => {
        const table = schema.tables.find((t: any) => t.name === tableName);
        expect(table.columns).toContainEqual(expect.objectContaining({ name: "server_id" }));
      });
    });

    it("each table should have created_at column", () => {
      allTables.forEach((tableName) => {
        const table = schema.tables.find((t: any) => t.name === tableName);
        expect(table.columns).toContainEqual(expect.objectContaining({ name: "created_at" }));
      });
    });

    it("each table should have updated_at column", () => {
      allTables.forEach((tableName) => {
        const table = schema.tables.find((t: any) => t.name === tableName);
        expect(table.columns).toContainEqual(expect.objectContaining({ name: "updated_at" }));
      });
    });
  });

  describe("Families table specific columns", () => {
    let familiesTable: any;

    beforeEach(() => {
      familiesTable = schema.tables.find((t: any) => t.name === "families");
    });

    it("should have name column", () => {
      expect(familiesTable.columns).toContainEqual(expect.objectContaining({ name: "name" }));
    });

    it("should have invite_code column", () => {
      expect(familiesTable.columns).toContainEqual(expect.objectContaining({ name: "invite_code" }));
    });

    it("should have ntfy_topic_prefix column", () => {
      expect(familiesTable.columns).toContainEqual(expect.objectContaining({ name: "ntfy_topic_prefix" }));
    });

    it("should have created_by_id column", () => {
      expect(familiesTable.columns).toContainEqual(expect.objectContaining({ name: "created_by_id" }));
    });
  });

  describe("Members table specific columns", () => {
    let membersTable: any;

    beforeEach(() => {
      membersTable = schema.tables.find((t: any) => t.name === "members");
    });

    it("should have name column", () => {
      expect(membersTable.columns).toContainEqual(expect.objectContaining({ name: "name" }));
    });

    it("should have email column", () => {
      expect(membersTable.columns).toContainEqual(expect.objectContaining({ name: "email" }));
    });

    it("should have role column", () => {
      expect(membersTable.columns).toContainEqual(expect.objectContaining({ name: "role" }));
    });

    it("should have family_id column", () => {
      expect(membersTable.columns).toContainEqual(expect.objectContaining({ name: "family_id" }));
    });

    it("should have avatar column (optional)", () => {
      expect(membersTable.columns).toContainEqual(
        expect.objectContaining({ name: "avatar", isOptional: true }),
      );
    });

    it("should have location_sharing_mode column (optional)", () => {
      expect(membersTable.columns).toContainEqual(
        expect.objectContaining({ name: "location_sharing_mode", isOptional: true }),
      );
    });

    it("should have location_sharing_until column (optional)", () => {
      expect(membersTable.columns).toContainEqual(
        expect.objectContaining({ name: "location_sharing_until", isOptional: true }),
      );
    });

    it("should have last_lat column (optional)", () => {
      expect(membersTable.columns).toContainEqual(
        expect.objectContaining({ name: "last_lat", isOptional: true }),
      );
    });

    it("should have last_lng column (optional)", () => {
      expect(membersTable.columns).toContainEqual(
        expect.objectContaining({ name: "last_lng", isOptional: true }),
      );
    });

    it("should have last_location_at column (optional)", () => {
      expect(membersTable.columns).toContainEqual(
        expect.objectContaining({ name: "last_location_at", isOptional: true }),
      );
    });
  });

  describe("Lists table specific columns", () => {
    let listsTable: any;

    beforeEach(() => {
      listsTable = schema.tables.find((t: any) => t.name === "lists");
    });

    it("should have name column", () => {
      expect(listsTable.columns).toContainEqual(expect.objectContaining({ name: "name" }));
    });

    it("should have type column", () => {
      expect(listsTable.columns).toContainEqual(expect.objectContaining({ name: "type" }));
    });

    it("should have family_id column", () => {
      expect(listsTable.columns).toContainEqual(expect.objectContaining({ name: "family_id" }));
    });

    it("should have assigned_to_id column (optional)", () => {
      expect(listsTable.columns).toContainEqual(
        expect.objectContaining({ name: "assigned_to_id", isOptional: true }),
      );
    });

    it("should have status column", () => {
      expect(listsTable.columns).toContainEqual(expect.objectContaining({ name: "status" }));
    });

    it("should have sort_order column", () => {
      expect(listsTable.columns).toContainEqual(expect.objectContaining({ name: "sort_order" }));
    });

    it("should have created_by_id column (optional)", () => {
      expect(listsTable.columns).toContainEqual(
        expect.objectContaining({ name: "created_by_id", isOptional: true }),
      );
    });
  });

  describe("List Items table specific columns", () => {
    let listItemsTable: any;

    beforeEach(() => {
      listItemsTable = schema.tables.find((t: any) => t.name === "list_items");
    });

    it("should have list_id column", () => {
      expect(listItemsTable.columns).toContainEqual(expect.objectContaining({ name: "list_id" }));
    });

    it("should have name column", () => {
      expect(listItemsTable.columns).toContainEqual(expect.objectContaining({ name: "name" }));
    });

    it("should have quantity column (optional)", () => {
      expect(listItemsTable.columns).toContainEqual(
        expect.objectContaining({ name: "quantity", isOptional: true }),
      );
    });

    it("should have note column (optional)", () => {
      expect(listItemsTable.columns).toContainEqual(
        expect.objectContaining({ name: "note", isOptional: true }),
      );
    });

    it("should have is_checked column", () => {
      expect(listItemsTable.columns).toContainEqual(expect.objectContaining({ name: "is_checked" }));
    });

    it("should have checked_by_id column (optional)", () => {
      expect(listItemsTable.columns).toContainEqual(
        expect.objectContaining({ name: "checked_by_id", isOptional: true }),
      );
    });

    it("should have sort_order column", () => {
      expect(listItemsTable.columns).toContainEqual(expect.objectContaining({ name: "sort_order" }));
    });

    it("should have created_by_id column (optional)", () => {
      expect(listItemsTable.columns).toContainEqual(
        expect.objectContaining({ name: "created_by_id", isOptional: true }),
      );
    });
  });

  describe("Location History table specific columns", () => {
    let locationHistoryTable: any;

    beforeEach(() => {
      locationHistoryTable = schema.tables.find((t: any) => t.name === "location_history");
    });

    it("should have user_id column", () => {
      expect(locationHistoryTable.columns).toContainEqual(expect.objectContaining({ name: "user_id" }));
    });

    it("should have lat column", () => {
      expect(locationHistoryTable.columns).toContainEqual(expect.objectContaining({ name: "lat" }));
    });

    it("should have lng column", () => {
      expect(locationHistoryTable.columns).toContainEqual(expect.objectContaining({ name: "lng" }));
    });

    it("should have accuracy column (optional)", () => {
      expect(locationHistoryTable.columns).toContainEqual(
        expect.objectContaining({ name: "accuracy", isOptional: true }),
      );
    });

    it("should have battery_level column (optional)", () => {
      expect(locationHistoryTable.columns).toContainEqual(
        expect.objectContaining({ name: "battery_level", isOptional: true }),
      );
    });

    it("should have timestamp column", () => {
      expect(locationHistoryTable.columns).toContainEqual(expect.objectContaining({ name: "timestamp" }));
    });
  });

  describe("Geofences table specific columns", () => {
    let geofencesTable: any;

    beforeEach(() => {
      geofencesTable = schema.tables.find((t: any) => t.name === "geofences");
    });

    it("should have family_id column", () => {
      expect(geofencesTable.columns).toContainEqual(expect.objectContaining({ name: "family_id" }));
    });

    it("should have name column", () => {
      expect(geofencesTable.columns).toContainEqual(expect.objectContaining({ name: "name" }));
    });

    it("should have lat column", () => {
      expect(geofencesTable.columns).toContainEqual(expect.objectContaining({ name: "lat" }));
    });

    it("should have lng column", () => {
      expect(geofencesTable.columns).toContainEqual(expect.objectContaining({ name: "lng" }));
    });

    it("should have radius column", () => {
      expect(geofencesTable.columns).toContainEqual(expect.objectContaining({ name: "radius" }));
    });

    it("should have notify_user_id column (optional)", () => {
      expect(geofencesTable.columns).toContainEqual(
        expect.objectContaining({ name: "notify_user_id", isOptional: true }),
      );
    });

    it("should have watch_user_id column (optional)", () => {
      expect(geofencesTable.columns).toContainEqual(
        expect.objectContaining({ name: "watch_user_id", isOptional: true }),
      );
    });

    it("should have trigger_on column (optional)", () => {
      expect(geofencesTable.columns).toContainEqual(
        expect.objectContaining({ name: "trigger_on", isOptional: true }),
      );
    });

    it("should have is_enabled column", () => {
      expect(geofencesTable.columns).toContainEqual(expect.objectContaining({ name: "is_enabled" }));
    });
  });
});
