using LinearStyle.Api.Domain;

namespace LinearStyle.Api.Contracts;

public static class ApiMappings
{
    public static SessionUserResponse ToResponse(this UserAccount user)
    {
        return new SessionUserResponse
        {
            Id = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            TeamIds = [.. user.Memberships.Select(membership => membership.TeamId).OrderBy(teamId => teamId)]
        };
    }

    public static TeamSummaryResponse ToSummary(this Team team)
    {
        return new TeamSummaryResponse
        {
            Id = team.Id,
            Name = team.Name,
            Key = team.Key
        };
    }

    public static ProjectSummaryResponse ToSummary(this Project project, int issueCount)
    {
        return new ProjectSummaryResponse
        {
            Id = project.Id,
            TeamId = project.TeamId,
            Name = project.Name,
            Key = project.Key,
            IssueCount = issueCount
        };
    }

    public static BoardStatusResponse ToResponse(this BoardStatus status)
    {
        return new BoardStatusResponse
        {
            Key = status.Key,
            Name = status.Name,
            Order = status.Order
        };
    }

    public static IssueResponse ToResponse(this Issue issue)
    {
        var assigneeResponse = issue.Assignee is null
            ? new IssueAssigneeResponse
            {
                Id = string.Empty,
                DisplayName = "Unassigned"
            }
            : new IssueAssigneeResponse
            {
                Id = issue.Assignee.Id,
                DisplayName = issue.Assignee.DisplayName
            };

        var response = new IssueResponse
        {
            Id = issue.Id,
            TeamId = issue.TeamId,
            ProjectId = issue.ProjectId,
            Identifier = issue.Identifier,
            Title = issue.Title,
            DescriptionHtml = issue.DescriptionHtml,
            State = issue.State,
            StatusKey = issue.StatusKey,
            Order = issue.Order,
            UpdatedAt = issue.UpdatedAt,
            StartsAt = issue.StartsAt,
            TargetDate = issue.TargetDate,
            Assignee = assigneeResponse
        };

        response.Labels.AddRange(
            issue.IssueLabels
                .Select(link => link.Label)
                .OrderBy(label => label.Name)
                .Select(
                    label =>
                        new IssueLabelResponse
                        {
                            Id = label.Id,
                            Name = label.Name,
                            Color = label.Color
                        }));

        return response;
    }

    public static TimelineItemResponse ToTimelineResponse(this Issue issue)
    {
        return new TimelineItemResponse
        {
            IssueId = issue.Id,
            ProjectId = issue.ProjectId,
            Identifier = issue.Identifier,
            Title = issue.Title,
            StatusKey = issue.StatusKey,
            StartsAt = issue.StartsAt,
            TargetDate = issue.TargetDate,
            UpdatedAt = issue.UpdatedAt
        };
    }

    public static PatIntrospectionResponse ToResponse(this PatPrincipal principal)
    {
        return new PatIntrospectionResponse
        {
            UserId = principal.UserId,
            DisplayName = principal.DisplayName,
            Scopes = [.. principal.Scopes],
            TeamIds = [.. principal.TeamIds]
        };
    }
}
