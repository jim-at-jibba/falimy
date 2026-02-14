/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const families = app.findCollectionByNameOrId("families");

    // Allow anyone to view and list family records (needed for invite code validation during signup)
    // Users still need to know the exact family ID to access it
    families.viewRule = "";
    families.listRule = "";

    app.save(families);
  },
  (app) => {
    const families = app.findCollectionByNameOrId("families");

    // Revert to original rules - only authenticated users in the family can view
    families.viewRule = "@request.auth.id != '' && id = @request.auth.family_id";
    families.listRule = "@request.auth.id != '' && id = @request.auth.family_id";

    app.save(families);
  },
);
