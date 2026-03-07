package httpapi

import (
	"net/http"
	"time"

	"github.com/example/linear-like/ext-api/internal/config"
	"github.com/example/linear-like/ext-api/internal/internalapi"
)

type Server struct {
	client     *internalapi.Client
	httpServer *http.Server
}

func NewServer(cfg config.Config, client *internalapi.Client) (*Server, error) {
	graphqlHandler, err := newGraphQLHandler(client)
	if err != nil {
		return nil, err
	}

	server := &Server{
		client: client,
	}

	mux := http.NewServeMux()
	mux.Handle("GET /api/ext/v4/version", withPAT(client, "read_api", http.HandlerFunc(server.handleVersion)))
	mux.Handle("GET /api/ext/v4/teams", withPAT(client, "read_api", http.HandlerFunc(server.handleTeams)))
	mux.Handle("GET /api/ext/v4/projects", withPAT(client, "read_api", http.HandlerFunc(server.handleProjects)))
	mux.Handle("GET /api/ext/v4/issues", withPAT(client, "read_api", http.HandlerFunc(server.handleIssues)))
	mux.Handle("GET /api/ext/v4/graphql", withPAT(client, "read_api", graphqlHandler))
	mux.Handle("POST /api/ext/v4/graphql", withPAT(client, "read_api", graphqlHandler))

	server.httpServer = &http.Server{
		Addr:              cfg.Addr,
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
	}

	return server, nil
}

func (server *Server) ListenAndServe() error {
	return server.httpServer.ListenAndServe()
}
