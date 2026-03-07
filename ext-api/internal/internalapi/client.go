package internalapi

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/example/linear-like/ext-api/internal/model"
)

// Go 側は認証・権限・ドメイン整合性を持たず、ASP.NET Core の internal API を薄く読む役に徹します。
type Client struct {
	appAPIBaseURL         string
	httpClient            *http.Client
	internalServiceAPIKey string
}

func NewClient(appAPIBaseURL string, internalServiceAPIKey string) *Client {
	return &Client{
		appAPIBaseURL:         strings.TrimRight(appAPIBaseURL, "/"),
		httpClient:            &http.Client{Timeout: 10 * time.Second},
		internalServiceAPIKey: internalServiceAPIKey,
	}
}

func (client *Client) IntrospectPAT(ctx context.Context, token string) (model.Principal, error) {
	payload := map[string]string{
		"token": token,
	}

	var principal model.Principal
	if err := client.doJSON(ctx, http.MethodPost, "/internal/auth/pat/introspect", nil, payload, &principal); err != nil {
		return model.Principal{}, err
	}

	return principal, nil
}

func (client *Client) ListTeams(ctx context.Context, userID string) ([]model.Team, error) {
	query := url.Values{}
	query.Set("userId", userID)

	var teams []model.Team
	if err := client.doJSON(ctx, http.MethodGet, "/internal/ext/teams", query, nil, &teams); err != nil {
		return nil, err
	}

	return teams, nil
}

func (client *Client) ListProjects(ctx context.Context, userID string, teamID string) ([]model.Project, error) {
	query := url.Values{}
	query.Set("userId", userID)
	query.Set("teamId", teamID)

	var projects []model.Project
	if err := client.doJSON(ctx, http.MethodGet, "/internal/ext/projects", query, nil, &projects); err != nil {
		return nil, err
	}

	return projects, nil
}

func (client *Client) ListIssues(ctx context.Context, userID string, teamID string, projectID string, search string) ([]model.Issue, error) {
	query := url.Values{}
	query.Set("userId", userID)
	query.Set("teamId", teamID)
	query.Set("projectId", projectID)
	query.Set("search", search)

	var issues []model.Issue
	if err := client.doJSON(ctx, http.MethodGet, "/internal/ext/issues", query, nil, &issues); err != nil {
		return nil, err
	}

	return issues, nil
}

func (client *Client) doJSON(
	ctx context.Context,
	method string,
	path string,
	query url.Values,
	payload any,
	target any,
) error {
	requestURL := client.appAPIBaseURL + path
	if len(query) > 0 {
		requestURL += "?" + query.Encode()
	}

	var body io.Reader
	if payload != nil {
		jsonBytes, err := json.Marshal(payload)
		if err != nil {
			return fmt.Errorf("marshal payload: %w", err)
		}
		body = bytes.NewReader(jsonBytes)
	}

	request, err := http.NewRequestWithContext(ctx, method, requestURL, body)
	if err != nil {
		return fmt.Errorf("create request: %w", err)
	}

	request.Header.Set("Accept", "application/json")
	request.Header.Set("X-Internal-Service-Key", client.internalServiceAPIKey)
	if payload != nil {
		request.Header.Set("Content-Type", "application/json")
	}

	response, err := client.httpClient.Do(request)
	if err != nil {
		return fmt.Errorf("perform request: %w", err)
	}
	defer response.Body.Close()

	if response.StatusCode >= http.StatusBadRequest {
		responseBody, _ := io.ReadAll(response.Body)
		return fmt.Errorf("internal api returned %d: %s", response.StatusCode, strings.TrimSpace(string(responseBody)))
	}

	if target == nil {
		return nil
	}

	if err = json.NewDecoder(response.Body).Decode(target); err != nil {
		return fmt.Errorf("decode response: %w", err)
	}

	return nil
}
