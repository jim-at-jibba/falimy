package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"

	"github.com/pocketbase/pocketbase/core"
)

func RegenerateInvite(app core.App) func(e *core.RequestEvent) error {
	return func(e *core.RequestEvent) error {
		auth := e.Auth
		if auth == nil {
			return e.JSON(http.StatusUnauthorized, map[string]string{"message": "Authentication required."})
		}

		familyID := auth.GetString("family_id")
		if familyID == "" {
			return e.JSON(http.StatusBadRequest, map[string]string{"message": "User is not part of a family."})
		}

		role := auth.GetString("role")
		if role != "admin" {
			return e.JSON(http.StatusForbidden, map[string]string{"message": "Only admins can regenerate invite codes."})
		}

		family, err := app.FindRecordById("families", familyID)
		if err != nil {
			return e.JSON(http.StatusNotFound, map[string]string{"message": "Family not found."})
		}

		newCode, err := generateInviteCode()
		if err != nil {
			return e.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to generate invite code."})
		}

		family.Set("invite_code", newCode)
		if err := app.Save(family); err != nil {
			return e.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to save new invite code."})
		}

		return e.JSON(http.StatusOK, map[string]any{
			"success":     true,
			"invite_code": newCode,
			"family_id":   familyID,
		})
	}
}

func generateInviteCode() (string, error) {
	chars := "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
	result := make([]byte, 8)
	randomBytes := make([]byte, 8)

	if _, err := rand.Read(randomBytes); err != nil {
		return "", err
	}

	for i := 0; i < 8; i++ {
		result[i] = chars[int(randomBytes[i])%len(chars)]
	}

	return string(result), nil
}

func _() {
	var unused = hex.EncodeToString
	_ = unused
}
