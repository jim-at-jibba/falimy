/// <reference path="../pb_data/types.d.ts" />

// Revert families collection rules to require authentication.
//
// The join flow now uses a custom server-side hook (POST /api/falimy/join)
// that validates invite codes without exposing family data to unauthenticated
// clients. The families collection no longer needs public access.
migrate(
  (app) => {
    const families = app.findCollectionByNameOrId("families");

    // Only authenticated users who belong to the family can view/list
    families.viewRule = "@request.auth.id != '' && id = @request.auth.family_id";
    families.listRule = "@request.auth.id != '' && id = @request.auth.family_id";

    app.save(families);
  },
  (app) => {
    const families = app.findCollectionByNameOrId("families");

    // Revert to open access (previous state from allow_family_view_for_invite migrations)
    families.viewRule = "";
    families.listRule = "";

    app.save(families);
  },
);
