package httpapi

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/example/linear-like/ext-api/internal/internalapi"
)

func withPAT(client *internalapi.Client, requiredScope string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		authorization := request.Header.Get("Authorization")
		token := strings.TrimSpace(strings.TrimPrefix(authorization, "Bearer"))

		if token == "" {
			writeJSON(writer, http.StatusUnauthorized, map[string]string{
				"message": "PAT is required.",
			})
			return
		}

		principal, err := client.IntrospectPAT(request.Context(), token)
		if err != nil {
			writeJSON(writer, http.StatusUnauthorized, map[string]string{
				"message": err.Error(),
			})
			return
		}

		if requiredScope != "" && !principal.HasScope(requiredScope) {
			writeJSON(writer, http.StatusForbidden, map[string]string{
				"message": "The PAT does not have the required scope.",
			})
			return
		}

		next.ServeHTTP(writer, request.WithContext(withPrincipal(request.Context(), principal)))
	})
}

func writeJSON(writer http.ResponseWriter, statusCode int, payload any) {
	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(statusCode)
	_ = json.NewEncoder(writer).Encode(payload)
}
