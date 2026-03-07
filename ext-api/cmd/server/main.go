package main

import (
	"log"

	"github.com/example/linear-like/ext-api/internal/config"
	"github.com/example/linear-like/ext-api/internal/httpapi"
	"github.com/example/linear-like/ext-api/internal/internalapi"
)

func main() {
	cfg := config.Load()
	client := internalapi.NewClient(cfg.AppAPIBaseURL, cfg.InternalServiceAPIKey)
	server, err := httpapi.NewServer(cfg, client)
	if err != nil {
		log.Fatalf("failed to create server: %v", err)
	}

	log.Printf("external API listening on %s", cfg.Addr)
	if serveErr := server.ListenAndServe(); serveErr != nil {
		log.Fatalf("server stopped: %v", serveErr)
	}
}
