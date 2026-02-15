jest.mock("@nozbe/watermelondb/decorators", () => ({
  field: jest.fn(() => () => {}),
  text: jest.fn(() => () => {}),
  date: jest.fn(() => () => {}),
  readonly: jest.fn(() => () => {}),
  relation: jest.fn(() => () => {}),
  children: jest.fn(() => () => {}),
  action: jest.fn(() => () => {}),
  writer: jest.fn(() => () => {}),
  lazy: jest.fn((target, key, descriptor) => descriptor),
}));

import Family from "../Family";
import Member from "../Member";
import List from "../List";
import ListItem from "../ListItem";
import LocationHistory from "../LocationHistory";
import Geofence from "../Geofence";

describe("Family Model", () => {
  it("has the correct table name", () => {
    expect(Family.table).toBe("families");
  });

  it("has correct associations", () => {
    expect(Family.associations).toBeDefined();
    expect(Family.associations.members).toBeDefined();
    expect(Family.associations.lists).toBeDefined();
    expect(Family.associations.geofences).toBeDefined();
    expect(Family.associations.members.type).toBe("has_many");
    expect(Family.associations.lists.type).toBe("has_many");
    expect(Family.associations.geofences.type).toBe("has_many");
  });
});

describe("Member Model", () => {
  it("has the correct table name", () => {
    expect(Member.table).toBe("members");
  });

  it("has correct associations", () => {
    expect(Member.associations).toBeDefined();
    expect(Member.associations.families).toBeDefined();
    expect(Member.associations.families.type).toBe("belongs_to");
  });


});

describe("List Model", () => {
  it("has the correct table name", () => {
    expect(List.table).toBe("lists");
  });

  it("has correct associations", () => {
    expect(List.associations).toBeDefined();
    expect(List.associations.families).toBeDefined();
    expect(List.associations.list_items).toBeDefined();
    expect(List.associations.families.type).toBe("belongs_to");
    expect(List.associations.list_items.type).toBe("has_many");
  });


});

describe("ListItem Model", () => {
  it("has the correct table name", () => {
    expect(ListItem.table).toBe("list_items");
  });

  it("has correct associations", () => {
    expect(ListItem.associations).toBeDefined();
    expect(ListItem.associations.lists).toBeDefined();
    expect(ListItem.associations.lists.type).toBe("belongs_to");
  });
});

describe("LocationHistory Model", () => {
  it("has the correct table name", () => {
    expect(LocationHistory.table).toBe("location_history");
  });

  it("has no associations defined", () => {
    // LocationHistory does not define static associations
    expect(LocationHistory.associations).toBeUndefined();
  });
});

describe("Geofence Model", () => {
  it("has the correct table name", () => {
    expect(Geofence.table).toBe("geofences");
  });

  it("has correct associations", () => {
    expect(Geofence.associations).toBeDefined();
    expect(Geofence.associations.families).toBeDefined();
    expect(Geofence.associations.families.type).toBe("belongs_to");
  });

});
