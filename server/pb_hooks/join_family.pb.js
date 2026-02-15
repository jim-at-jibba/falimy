/// <reference path="../pb_data/types.d.ts" />

// POST /api/falimy/join
//
// Validates an invite code server-side and creates a new user account
// in a single request. The invite code never leaves the server.

routerAdd("POST", "/api/falimy/join", (e) => {
  try {
    const ip = e.realIP();
    const body = e.requestInfo().body;

    const familyId = String(body.familyId || "").trim();
    const inviteCode = String(body.inviteCode || "").trim();
    const email = String(body.email || "").trim();
    const password = String(body.password || "");
    const name = String(body.name || "").trim();

    // --- Validate required fields ---
    if (!familyId || !inviteCode || !email || !password || !name) {
      return e.json(400, {
        message: "All fields are required: familyId, inviteCode, email, password, name.",
      });
    }

    if (password.length < 8) {
      return e.json(400, {
        message: "Password must be at least 8 characters.",
      });
    }

    // --- Look up the family ---
    let family;
    try {
      family = $app.findRecordById("families", familyId);
    } catch (err) {
      return e.json(404, {
        message: "Family not found. Check the Family ID.",
      });
    }

    // --- Validate invite code server-side ---
    const actualCode = family.get("invite_code");
    if (!actualCode || String(actualCode) !== inviteCode) {
      return e.json(401, {
        message: "Invalid invite code. Please check and try again.",
      });
    }

    // --- Create the user record ---
    let user;
    try {
      const usersCollection = $app.findCollectionByNameOrId("users");
      user = new Record(usersCollection);
      user.set("email", email);
      user.set("name", name);
      user.setPassword(password);
      user.set("role", "member");
      user.set("family_id", family.id);
      user.set("verified", false);

      $app.save(user);
    } catch (err) {
      const errStr = String(err);
      if (errStr.includes("unique") || errStr.includes("email")) {
        return e.json(409, {
          message: "Email already in use. Try logging in instead.",
        });
      }
      return e.json(500, {
        message: "Could not create account. " + errStr,
      });
    }

    // --- Generate auth token ---
    let token;
    try {
      token = user.newAuthToken();
    } catch (err) {
      return e.json(500, {
        message: "Account created but failed to generate auth token. Try logging in.",
      });
    }

    return e.json(200, {
      token: token,
      record: user,
    });
  } catch (err) {
    console.error("[join-family] Error:", err);
    return e.json(500, { message: "Internal error: " + String(err) });
  }
});
