package main

import (
	"falimy-server/internal/handlers"
	"log"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/jsvm"
)

func main() {
	app := pocketbase.NewWithConfig(pocketbase.Config{
		DefaultDataDir: "/pb_data",
	})

	jsvm.MustRegister(app, jsvm.Config{})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.POST("/api/falimy/join", handlers.JoinFamily(app))
		se.Router.POST("/api/falimy/regenerate-invite", handlers.RegenerateInvite(app)).Bind(apis.RequireAuth())
		se.Router.POST("/api/falimy/extract-recipe", handlers.ExtractRecipe(app)).Bind(apis.RequireAuth())
		return se.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
