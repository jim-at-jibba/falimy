/// <reference path="../pb_data/types.d.ts" />

/**
 * Add input validation constraints to prevent malicious or oversized data
 * - Field length limits (name, invite_code, notes)
 * - Coordinate ranges (lat: -90 to 90, lng: -180 to 180)
 * - Reasonable radius bounds (1m to 100km)
 * - Battery level range (0-100)
 */
migrate(
  (app) => {
    // Update families collection
    const families = app.findCollectionByNameOrId("families");
    
    // Add validation to name field
    families.fields.getByName("name").options = {
      min: 1,
      max: 100,
      pattern: "",
    };
    
    // Add validation to invite_code field
    families.fields.getByName("invite_code").options = {
      min: 6,
      max: 12,
      pattern: "^[a-z0-9]+$", // Only lowercase alphanumeric
    };
    
    // Add validation to ntfy_topic_prefix
    families.fields.getByName("ntfy_topic_prefix").options = {
      min: 1,
      max: 50,
      pattern: "^fam_[a-z0-9]+$", // Must start with fam_
    };
    
    app.save(families);

    // Update users collection
    const users = app.findCollectionByNameOrId("users");
    
    // Add validation to name field
    const nameField = users.fields.getByName("name");
    if (nameField) {
      nameField.options = {
        min: 1,
        max: 100,
        pattern: "",
      };
    }
    
    // Add coordinate range validation
    const lastLatField = users.fields.getByName("last_lat");
    if (lastLatField) {
      lastLatField.options = {
        min: -90,
        max: 90,
        noDecimal: false,
      };
    }
    
    const lastLngField = users.fields.getByName("last_lng");
    if (lastLngField) {
      lastLngField.options = {
        min: -180,
        max: 180,
        noDecimal: false,
      };
    }
    
    app.save(users);

    // Update lists collection
    const lists = app.findCollectionByNameOrId("lists");
    
    lists.fields.getByName("name").options = {
      min: 1,
      max: 200,
      pattern: "",
    };
    
    // Ensure sort_order is reasonable
    const sortOrderField = lists.fields.getByName("sort_order");
    if (sortOrderField) {
      sortOrderField.options = {
        min: 0,
        max: 999999,
        noDecimal: true,
      };
    }
    
    app.save(lists);

    // Update list_items collection
    const listItems = app.findCollectionByNameOrId("list_items");
    
    listItems.fields.getByName("name").options = {
      min: 1,
      max: 500, // Item names can be longer
      pattern: "",
    };
    
    const quantityField = listItems.fields.getByName("quantity");
    if (quantityField) {
      quantityField.options = {
        min: 0,
        max: 100,
        pattern: "",
      };
    }
    
    const noteField = listItems.fields.getByName("note");
    if (noteField) {
      noteField.options = {
        min: 0,
        max: 1000,
        pattern: "",
      };
    }
    
    const itemSortField = listItems.fields.getByName("sort_order");
    if (itemSortField) {
      itemSortField.options = {
        min: 0,
        max: 999999,
        noDecimal: true,
      };
    }
    
    app.save(listItems);

    // Update location_history collection
    const locationHistory = app.findCollectionByNameOrId("location_history");
    
    // Add coordinate validation
    const latField = locationHistory.fields.getByName("lat");
    if (latField) {
      latField.options = {
        min: -90,
        max: 90,
        noDecimal: false,
      };
    }
    
    const lngField = locationHistory.fields.getByName("lng");
    if (lngField) {
      lngField.options = {
        min: -180,
        max: 180,
        noDecimal: false,
      };
    }
    
    // Accuracy should be positive
    const accuracyField = locationHistory.fields.getByName("accuracy");
    if (accuracyField) {
      accuracyField.options = {
        min: 0,
        max: 10000, // 10km max accuracy seems reasonable
        noDecimal: false,
      };
    }
    
    // Battery level 0-100
    const batteryField = locationHistory.fields.getByName("battery_level");
    if (batteryField) {
      batteryField.options = {
        min: 0,
        max: 100,
        noDecimal: true,
      };
    }
    
    app.save(locationHistory);

    // Update geofences collection
    const geofences = app.findCollectionByNameOrId("geofences");
    
    geofences.fields.getByName("name").options = {
      min: 1,
      max: 100,
      pattern: "",
    };
    
    // Add coordinate validation
    const geoLatField = geofences.fields.getByName("lat");
    if (geoLatField) {
      geoLatField.options = {
        min: -90,
        max: 90,
        noDecimal: false,
      };
    }
    
    const geoLngField = geofences.fields.getByName("lng");
    if (geoLngField) {
      geoLngField.options = {
        min: -180,
        max: 180,
        noDecimal: false,
      };
    }
    
    // Radius: 1m to 100km (100,000m)
    const radiusField = geofences.fields.getByName("radius");
    if (radiusField) {
      radiusField.options = {
        min: 1,
        max: 100000,
        noDecimal: false,
      };
    }
    
    app.save(geofences);
  },
  (app) => {
    // Rollback - remove validation options
    const collections = ["families", "users", "lists", "list_items", "location_history", "geofences"];
    
    for (const collectionName of collections) {
      try {
        const collection = app.findCollectionByNameOrId(collectionName);
        
        // Reset all field options to empty
        for (const field of collection.fields) {
          if (field.options) {
            field.options = {};
          }
        }
        
        app.save(collection);
      } catch {
        // Ignore if collection not found
      }
    }
  },
);
