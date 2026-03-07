package httpapi

import (
	"context"
	"net/http"

	"github.com/example/linear-like/ext-api/internal/internalapi"
	"github.com/example/linear-like/ext-api/internal/model"
	graphql "github.com/graphql-go/graphql"
	graphqhandler "github.com/graphql-go/handler"
)

// GraphQL は横断取得専用の read surface として先に用意し、write は REST / Jobs に逃がせるようにしています。
func newGraphQLHandler(client *internalapi.Client) (http.Handler, error) {
	labelType := graphql.NewObject(graphql.ObjectConfig{
		Name: "IssueLabel",
		Fields: graphql.Fields{
			"id":    &graphql.Field{Type: graphql.NewNonNull(graphql.ID)},
			"name":  &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
			"color": &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
		},
	})

	assigneeType := graphql.NewObject(graphql.ObjectConfig{
		Name: "IssueAssignee",
		Fields: graphql.Fields{
			"id":          &graphql.Field{Type: graphql.NewNonNull(graphql.ID)},
			"displayName": &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
		},
	})

	teamType := graphql.NewObject(graphql.ObjectConfig{
		Name: "Team",
		Fields: graphql.Fields{
			"id":   &graphql.Field{Type: graphql.NewNonNull(graphql.ID)},
			"name": &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
			"key":  &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
		},
	})

	projectType := graphql.NewObject(graphql.ObjectConfig{
		Name: "Project",
		Fields: graphql.Fields{
			"id":         &graphql.Field{Type: graphql.NewNonNull(graphql.ID)},
			"teamId":     &graphql.Field{Type: graphql.NewNonNull(graphql.ID)},
			"name":       &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
			"key":        &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
			"issueCount": &graphql.Field{Type: graphql.NewNonNull(graphql.Int)},
		},
	})

	issueType := graphql.NewObject(graphql.ObjectConfig{
		Name: "Issue",
		Fields: graphql.Fields{
			"id":              &graphql.Field{Type: graphql.NewNonNull(graphql.ID)},
			"teamId":          &graphql.Field{Type: graphql.NewNonNull(graphql.ID)},
			"projectId":       &graphql.Field{Type: graphql.NewNonNull(graphql.ID)},
			"identifier":      &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
			"title":           &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
			"descriptionHtml": &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
			"state":           &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
			"statusKey":       &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
			"order":           &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
			"updatedAt":       &graphql.Field{Type: graphql.NewNonNull(graphql.String)},
			"startsAt":        &graphql.Field{Type: graphql.String},
			"targetDate":      &graphql.Field{Type: graphql.String},
			"assignee":        &graphql.Field{Type: graphql.NewNonNull(assigneeType)},
			"labels":          &graphql.Field{Type: graphql.NewNonNull(graphql.NewList(graphql.NewNonNull(labelType)))},
		},
	})

	queryType := graphql.NewObject(graphql.ObjectConfig{
		Name: "Query",
		Fields: graphql.Fields{
			"version": &graphql.Field{
				Type: graphql.NewNonNull(graphql.String),
				Resolve: func(params graphql.ResolveParams) (any, error) {
					return "v4", nil
				},
			},
			"teams": &graphql.Field{
				Type: graphql.NewNonNull(graphql.NewList(graphql.NewNonNull(teamType))),
				Resolve: func(params graphql.ResolveParams) (any, error) {
					principal, ok := principalFromContext(params.Context)
					if !ok {
						return []model.Team{}, nil
					}

					return client.ListTeams(params.Context, principal.UserID)
				},
			},
			"projects": &graphql.Field{
				Type: graphql.NewNonNull(graphql.NewList(graphql.NewNonNull(projectType))),
				Args: graphql.FieldConfigArgument{
					"teamId": &graphql.ArgumentConfig{Type: graphql.ID},
				},
				Resolve: func(params graphql.ResolveParams) (any, error) {
					principal, teamID, ok := resolveScope(params.Context, params.Args)
					if !ok {
						return []model.Project{}, nil
					}

					return client.ListProjects(params.Context, principal.UserID, teamID)
				},
			},
			"issues": &graphql.Field{
				Type: graphql.NewNonNull(graphql.NewList(graphql.NewNonNull(issueType))),
				Args: graphql.FieldConfigArgument{
					"teamId":    &graphql.ArgumentConfig{Type: graphql.ID},
					"projectId": &graphql.ArgumentConfig{Type: graphql.ID},
					"search":    &graphql.ArgumentConfig{Type: graphql.String},
				},
				Resolve: func(params graphql.ResolveParams) (any, error) {
					principal, teamID, ok := resolveScope(params.Context, params.Args)
					if !ok {
						return []model.Issue{}, nil
					}

					projectID, _ := params.Args["projectId"].(string)
					search, _ := params.Args["search"].(string)
					return client.ListIssues(params.Context, principal.UserID, teamID, projectID, search)
				},
			},
		},
	})

	schema, err := graphql.NewSchema(graphql.SchemaConfig{
		Query: queryType,
	})
	if err != nil {
		return nil, err
	}

	return graphqhandler.New(&graphqhandler.Config{
		GraphiQL: true,
		Pretty:   true,
		Schema:   &schema,
	}), nil
}

func resolveScope(ctx context.Context, args map[string]any) (model.Principal, string, bool) {
	principal, ok := principalFromContext(ctx)
	if !ok {
		return model.Principal{}, "", false
	}

	teamID, _ := args["teamId"].(string)
	if teamID != "" {
		return principal, teamID, true
	}

	if len(principal.TeamIDs) == 0 {
		return principal, "", false
	}

	return principal, principal.TeamIDs[0], true
}
