namespace LinearStyle.Api.Contracts;

public sealed class SessionUserResponse
{
    public string Id { get; init; } = string.Empty;

    public string Email { get; init; } = string.Empty;

    public string DisplayName { get; init; } = string.Empty;

    public List<string> TeamIds { get; init; } = [];
}

public sealed class SignInRequest
{
    public string Email { get; init; } = string.Empty;

    public string Password { get; init; } = string.Empty;
}

public sealed class TeamSummaryResponse
{
    public string Id { get; init; } = string.Empty;

    public string Name { get; init; } = string.Empty;

    public string Key { get; init; } = string.Empty;
}

public sealed class ProjectSummaryResponse
{
    public string Id { get; init; } = string.Empty;

    public string TeamId { get; init; } = string.Empty;

    public string Name { get; init; } = string.Empty;

    public string Key { get; init; } = string.Empty;

    public int IssueCount { get; init; }
}

public sealed class IssueLabelResponse
{
    public string Id { get; init; } = string.Empty;

    public string Name { get; init; } = string.Empty;

    public string Color { get; init; } = string.Empty;
}

public sealed class IssueAssigneeResponse
{
    public string Id { get; init; } = string.Empty;

    public string DisplayName { get; init; } = string.Empty;
}

public sealed class IssueResponse
{
    public string Id { get; init; } = string.Empty;

    public string TeamId { get; init; } = string.Empty;

    public string ProjectId { get; init; } = string.Empty;

    public string Identifier { get; init; } = string.Empty;

    public string Title { get; init; } = string.Empty;

    public string DescriptionHtml { get; init; } = string.Empty;

    public string State { get; init; } = string.Empty;

    public string StatusKey { get; init; } = string.Empty;

    public string Order { get; init; } = string.Empty;

    public DateTimeOffset UpdatedAt { get; init; }

    public DateTimeOffset? StartsAt { get; init; }

    public DateTimeOffset? TargetDate { get; init; }

    public IssueAssigneeResponse Assignee { get; init; } = new();

    public List<IssueLabelResponse> Labels { get; } = [];
}

public sealed class BoardStatusResponse
{
    public string Key { get; init; } = string.Empty;

    public string Name { get; init; } = string.Empty;

    public int Order { get; init; }
}

public sealed class BoardResponse
{
    public string WorkspaceName { get; init; } = string.Empty;

    public TeamSummaryResponse ActiveTeam { get; init; } = new();

    public ProjectSummaryResponse ActiveProject { get; init; } = new();

    public List<ProjectSummaryResponse> Projects { get; } = [];

    public List<BoardStatusResponse> Statuses { get; } = [];

    public List<IssueResponse> Issues { get; } = [];
}

public sealed class CreateIssueRequest
{
    public string ProjectId { get; init; } = string.Empty;

    public string Title { get; init; } = string.Empty;

    public string DescriptionHtml { get; init; } = string.Empty;
}

public sealed class MoveIssueRequest
{
    public string StatusKey { get; init; } = string.Empty;

    public string BeforeIssueId { get; init; } = string.Empty;

    public string AfterIssueId { get; init; } = string.Empty;
}

public sealed class IssueSearchRequest
{
    public string TeamId { get; init; } = string.Empty;

    public string ProjectId { get; init; } = string.Empty;

    public string Search { get; init; } = string.Empty;

    public string State { get; init; } = string.Empty;

    public List<string> StatusKeys { get; init; } = [];

    public List<string> LabelNames { get; init; } = [];
}

public sealed class TimelineItemResponse
{
    public string IssueId { get; init; } = string.Empty;

    public string ProjectId { get; init; } = string.Empty;

    public string Identifier { get; init; } = string.Empty;

    public string Title { get; init; } = string.Empty;

    public string StatusKey { get; init; } = string.Empty;

    public DateTimeOffset? StartsAt { get; init; }

    public DateTimeOffset? TargetDate { get; init; }

    public DateTimeOffset UpdatedAt { get; init; }
}

public sealed class BoardChangedMessage
{
    public string ProjectId { get; init; } = string.Empty;

    public string Reason { get; init; } = string.Empty;

    public DateTimeOffset OccurredAt { get; init; }
}

public sealed class PatIntrospectionRequest
{
    public string Token { get; init; } = string.Empty;
}

public sealed class PatIntrospectionResponse
{
    public string UserId { get; init; } = string.Empty;

    public string DisplayName { get; init; } = string.Empty;

    public List<string> Scopes { get; init; } = [];

    public List<string> TeamIds { get; init; } = [];
}
