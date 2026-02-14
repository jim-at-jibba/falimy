/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const families = app.findCollectionByNameOrId("families");

    // Allow anyone to view family records (needed for invite code validation during signup)
    // Users still can only see families where they have the family ID (from QR code/invite)
    families.viewRule = "";

    app.save(families);
  },
  (app) => {
    const families = app.findCollectionByNameOrId("families");

    // Revert to original rule - only authenticated users in the family can view
    families.viewRule = "@request.auth.id != '' && id = @request.auth.family_id";

    app.save(families);
  },
);
