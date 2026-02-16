package handlers

import (
	"falimy-server/internal/ratelimit"
	"net/http"
	"strings"

	"github.com/pocketbase/pocketbase/core"
)

type JoinFamilyRequest struct {
	FamilyID   string `json:"familyId" form:"familyId"`
	InviteCode string `json:"inviteCode" form:"inviteCode"`
	Email      string `json:"email" form:"email"`
	Password   string `json:"password" form:"password"`
	Name       string `json:"name" form:"name"`
}

func JoinFamily(app core.App) func(e *core.RequestEvent) error {
	rl := ratelimit.New(5, 60*1000)

	return func(e *core.RequestEvent) error {
		ip := e.RealIP()
		if !rl.Allow(ip) {
			return e.JSON(http.StatusTooManyRequests, map[string]string{
				"message": "Too many requests. Please try again later.",
			})
		}

		var req JoinFamilyRequest
		if err := e.BindBody(&req); err != nil {
			return e.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid request body."})
		}

		familyID := strings.TrimSpace(req.FamilyID)
		inviteCode := strings.TrimSpace(req.InviteCode)
		email := strings.TrimSpace(req.Email)
		password := req.Password
		name := strings.TrimSpace(req.Name)

		if familyID == "" || inviteCode == "" || email == "" || password == "" || name == "" {
			return e.JSON(http.StatusBadRequest, map[string]string{
				"message": "All fields are required: familyId, inviteCode, email, password, name.",
			})
		}

		if len(password) < 8 {
			return e.JSON(http.StatusBadRequest, map[string]string{
				"message": "Password must be at least 8 characters.",
			})
		}

		family, err := app.FindRecordById("families", familyID)
		if err != nil {
			return e.JSON(http.StatusNotFound, map[string]string{
				"message": "Family not found. Check the Family ID.",
			})
		}

		actualCode := family.GetString("invite_code")
		if actualCode == "" || actualCode != inviteCode {
			return e.JSON(http.StatusUnauthorized, map[string]string{
				"message": "Invalid invite code. Please check and try again.",
			})
		}

		usersCollection, err := app.FindCollectionByNameOrId("users")
		if err != nil {
			return e.JSON(http.StatusInternalServerError, map[string]string{"message": "Users collection not found."})
		}

		user := core.NewRecord(usersCollection)
		user.SetEmail(email)
		user.Set("name", name)
		user.SetPassword(password)
		user.Set("role", "member")
		user.Set("family_id", family.Id)
		user.Set("verified", false)

		if err := app.Save(user); err != nil {
			if strings.Contains(err.Error(), "unique") || strings.Contains(err.Error(), "email") {
				return e.JSON(http.StatusConflict, map[string]string{
					"message": "Email already in use. Try logging in instead.",
				})
			}
			return e.JSON(http.StatusInternalServerError, map[string]string{
				"message": "Could not create account. " + err.Error(),
			})
		}

		token, err := user.NewAuthToken()
		if err != nil {
			return e.JSON(http.StatusInternalServerError, map[string]string{
				"message": "Account created but failed to generate auth token. Try logging in.",
			})
		}

		return e.JSON(http.StatusOK, map[string]any{
			"token":  token,
			"record": user,
		})
	}
}
