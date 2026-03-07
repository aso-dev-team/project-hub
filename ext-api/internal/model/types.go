package model

type Principal struct {
	UserID      string   `json:"userId"`
	DisplayName string   `json:"displayName"`
	Scopes      []string `json:"scopes"`
	TeamIDs     []string `json:"teamIds"`
}

type Team struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Key  string `json:"key"`
}

type Project struct {
	ID         string `json:"id"`
	TeamID     string `json:"teamId"`
	Name       string `json:"name"`
	Key        string `json:"key"`
	IssueCount int    `json:"issueCount"`
}

type IssueLabel struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Color string `json:"color"`
}

type IssueAssignee struct {
	ID          string `json:"id"`
	DisplayName string `json:"displayName"`
}

type Issue struct {
	ID              string        `json:"id"`
	TeamID          string        `json:"teamId"`
	ProjectID       string        `json:"projectId"`
	Identifier      string        `json:"identifier"`
	Title           string        `json:"title"`
	DescriptionHTML string        `json:"descriptionHtml"`
	State           string        `json:"state"`
	StatusKey       string        `json:"statusKey"`
	Order           string        `json:"order"`
	UpdatedAt       string        `json:"updatedAt"`
	StartsAt        string        `json:"startsAt,omitempty"`
	TargetDate      string        `json:"targetDate,omitempty"`
	Assignee        IssueAssignee `json:"assignee"`
	Labels          []IssueLabel  `json:"labels"`
}

type VersionResponse struct {
	Service string `json:"service"`
	Version string `json:"version"`
}

func (principal Principal) HasScope(scope string) bool {
	for _, candidate := range principal.Scopes {
		if candidate == scope {
			return true
		}
	}

	return false
}
