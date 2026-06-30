namespace LinearStyle.Api.Domain;

// ドメインの中心は ASP.NET Core 側に寄せます。
// 将来的に read を Dapper へ逃がしても、entity / relation の正はこの層で保ちます。
public sealed class Workspace
{
    public string Id { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public List<Team> Teams { get; } = [];
}

public sealed class Team
{
    public string Id { get; set; } = string.Empty;

    public string WorkspaceId { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Key { get; set; } = string.Empty;

    public Workspace Workspace { get; set; } = null!;

    public List<Project> Projects { get; } = [];

    public List<TeamMembership> Memberships { get; } = [];
}

public sealed class Project
{
    public string Id { get; set; } = string.Empty;

    public string TeamId { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Key { get; set; } = string.Empty;

    public bool Archived { get; set; }

    public Team Team { get; set; } = null!;

    public List<BoardStatus> Statuses { get; } = [];

    public List<Label> Labels { get; } = [];

    public List<Issue> Issues { get; } = [];
}

public sealed class BoardStatus
{
    public string Id { get; set; } = string.Empty;

    public string ProjectId { get; set; } = string.Empty;

    public string Key { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public int Order { get; set; }

    public Project Project { get; set; } = null!;
}

public sealed class Label
{
    public string Id { get; set; } = string.Empty;

    public string ProjectId { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Color { get; set; } = string.Empty;

    public Project Project { get; set; } = null!;

    public List<IssueLabel> IssueLabels { get; } = [];
}

public sealed class Issue
{
    public string Id { get; set; } = string.Empty;

    public string TeamId { get; set; } = string.Empty;

    public string ProjectId { get; set; } = string.Empty;

    public string Identifier { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string DescriptionHtml { get; set; } = string.Empty;

    public string State { get; set; } = "open";

    public string StatusKey { get; set; } = "todo";

    public string Order { get; set; } = string.Empty;

    // assignee は domain 上 optional なため nullable を許容します。
    public string? AssigneeUserId { get; set; }

    // timeline / gantt 表示用の任意列です。初期段階では roadmap 系 issue のみ seed します。
    public DateTimeOffset? StartsAt { get; set; }

    public DateTimeOffset? TargetDate { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Project Project { get; set; } = null!;

    public UserAccount? Assignee { get; set; }

    public List<IssueLabel> IssueLabels { get; } = [];
}

public sealed class IssueLabel
{
    public string IssueId { get; set; } = string.Empty;

    public string LabelId { get; set; } = string.Empty;

    public Issue Issue { get; set; } = null!;

    public Label Label { get; set; } = null!;
}

public sealed class UserAccount
{
    public string Id { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string NormalizedEmail { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string DisplayName { get; set; } = string.Empty;

    public List<TeamMembership> Memberships { get; } = [];

    public List<Issue> AssignedIssues { get; } = [];

    public List<PersonalAccessToken> PersonalAccessTokens { get; } = [];
}

public sealed class TeamMembership
{
    public string TeamId { get; set; } = string.Empty;

    public string UserId { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public Team Team { get; set; } = null!;

    public UserAccount User { get; set; } = null!;
}

public sealed class PersonalAccessToken
{
    public string Id { get; set; } = string.Empty;

    public string UserId { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Hash { get; set; } = string.Empty;

    public string[] Scopes { get; set; } = [];

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset LastUsedAt { get; set; }

    public DateTimeOffset? ExpiresAt { get; set; }

    public DateTimeOffset? RevokedAt { get; set; }

    public UserAccount User { get; set; } = null!;
}

public sealed class PatPrincipal
{
    public string UserId { get; init; } = string.Empty;

    public string DisplayName { get; init; } = string.Empty;

    public List<string> Scopes { get; init; } = [];

    public List<string> TeamIds { get; init; } = [];
}
