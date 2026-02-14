/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const families = app.findCollectionByNameOrId("families");

    // Allow anyone to view and list family records (needed for invite code validation during signup)
    // Users still can only see families where they have the family ID (from QR code/invite)
    families.viewRule = "";
    families.listRule = "";
    
    // Make sure the invite_code field is visible to everyone
    const inviteCodeField = families.fields.getByName("invite_code");
    if (inviteCodeField) {
      inviteCodeField.hidden = false;
      inviteCodeField.presentable = true;
    }

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
