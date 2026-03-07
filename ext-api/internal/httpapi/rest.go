package httpapi

import (
	"net/http"

	"github.com/example/linear-like/ext-api/internal/model"
)

func (server *Server) handleVersion(writer http.ResponseWriter, request *http.Request) {
	writeJSON(writer, http.StatusOK, model.VersionResponse{
		Service: "ext-api",
		Version: "v4",
	})
}

func (server *Server) handleTeams(writer http.ResponseWriter, request *http.Request) {
	principal, ok := principalFromContext(request.Context())
	if !ok {
		writeJSON(writer, http.StatusUnauthorized, map[string]string{
			"message": "PAT principal was not resolved.",
		})
		return
	}

	teams, err := server.client.ListTeams(request.Context(), principal.UserID)
	if err != nil {
		writeJSON(writer, http.StatusBadGateway, map[string]string{
			"message": err.Error(),
		})
		return
	}

	writeJSON(writer, http.StatusOK, teams)
}

func (server *Server) handleProjects(writer http.ResponseWriter, request *http.Request) {
	principal, ok := principalFromContext(request.Context())
	if !ok {
		writeJSON(writer, http.StatusUnauthorized, map[string]string{
			"message": "PAT principal was not resolved.",
		})
		return
	}

	teamID := request.URL.Query().Get("team_id")
	if teamID == "" {
		if len(principal.TeamIDs) == 0 {
			writeJSON(writer, http.StatusBadRequest, map[string]string{
				"message": "team_id is required when the PAT has no team access.",
			})
			return
		}
		teamID = principal.TeamIDs[0]
	}

	projects, err := server.client.ListProjects(request.Context(), principal.UserID, teamID)
	if err != nil {
		writeJSON(writer, http.StatusBadGateway, map[string]string{
			"message": err.Error(),
		})
		return
	}

	writeJSON(writer, http.StatusOK, projects)
}

func (server *Server) handleIssues(writer http.ResponseWriter, request *http.Request) {
	principal, ok := principalFromContext(request.Context())
	if !ok {
		writeJSON(writer, http.StatusUnauthorized, map[string]string{
			"message": "PAT principal was not resolved.",
		})
		return
	}

	teamID := request.URL.Query().Get("team_id")
	if teamID == "" {
		if len(principal.TeamIDs) == 0 {
			writeJSON(writer, http.StatusBadRequest, map[string]string{
				"message": "team_id is required when the PAT has no team access.",
			})
			return
		}
		teamID = principal.TeamIDs[0]
	}

	projectID := request.URL.Query().Get("project_id")
	search := request.URL.Query().Get("search")

	issues, err := server.client.ListIssues(request.Context(), principal.UserID, teamID, projectID, search)
	if err != nil {
		writeJSON(writer, http.StatusBadGateway, map[string]string{
			"message": err.Error(),
		})
		return
	}

	writeJSON(writer, http.StatusOK, issues)
}
