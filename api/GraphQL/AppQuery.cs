using System.Security.Claims;
using HotChocolate;
using LinearStyle.Api.Contracts;
using LinearStyle.Api.Services;

namespace LinearStyle.Api.GraphQL;

public sealed class AppQuery
{
    public async Task<SessionUserResponse> Viewer(
        [Service] IUserSessionService userSessionService,
        [Service] IHttpContextAccessor httpContextAccessor,
        CancellationToken cancellationToken)
    {
        var userId = GetRequiredUserId(httpContextAccessor);
        var user = await userSessionService.GetUserByIdAsync(userId, cancellationToken);
        return user.ToResponse();
    }

    public Task<IReadOnlyList<TeamSummaryResponse>> Teams(
        [Service] IBoardQueryService boardQueryService,
        [Service] IHttpContextAccessor httpContextAccessor,
        CancellationToken cancellationToken)
    {
        var userId = GetRequiredUserId(httpContextAccessor);
        return boardQueryService.GetTeamsForUserAsync(userId, cancellationToken);
    }

    public Task<IReadOnlyList<ProjectSummaryResponse>> Projects(
        string teamId,
        [Service] IBoardQueryService boardQueryService,
        [Service] IHttpContextAccessor httpContextAccessor,
        CancellationToken cancellationToken)
    {
        var userId = GetRequiredUserId(httpContextAccessor);
        return boardQueryService.GetProjectsForUserAsync(userId, teamId, cancellationToken);
    }

    public Task<BoardResponse> Board(
        string teamId,
        string projectId,
        [Service] IBoardQueryService boardQueryService,
        [Service] IHttpContextAccessor httpContextAccessor,
        CancellationToken cancellationToken)
    {
        var userId = GetRequiredUserId(httpContextAccessor);
        return boardQueryService.GetBoardAsync(userId, teamId, projectId, cancellationToken);
    }

    public Task<IReadOnlyList<IssueResponse>> Issues(
        IssueSearchInput filter,
        [Service] IBoardQueryService boardQueryService,
        [Service] IHttpContextAccessor httpContextAccessor,
        CancellationToken cancellationToken)
    {
        var userId = GetRequiredUserId(httpContextAccessor);
        return boardQueryService.SearchIssuesAsync(
            userId,
            new IssueSearchRequest
            {
                TeamId = filter.TeamId,
                ProjectId = filter.ProjectId,
                Search = filter.Search,
                State = filter.State,
                StatusKeys = [.. filter.StatusKeys],
                LabelNames = [.. filter.LabelNames]
            },
            cancellationToken);
    }

    public Task<IReadOnlyList<TimelineItemResponse>> Timeline(
        string teamId,
        string projectId,
        [Service] IBoardQueryService boardQueryService,
        [Service] IHttpContextAccessor httpContextAccessor,
        CancellationToken cancellationToken)
    {
        var userId = GetRequiredUserId(httpContextAccessor);
        return boardQueryService.GetTimelineAsync(userId, teamId, projectId, cancellationToken);
    }

    private static string GetRequiredUserId(IHttpContextAccessor httpContextAccessor)
    {
        var userId = httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        if (userId.Length == 0)
        {
            throw new UnauthorizedAccessException("Authenticated user was not resolved.");
        }

        return userId;
    }
}

public sealed class IssueSearchInput
{
    public string TeamId { get; init; } = string.Empty;

    public string ProjectId { get; init; } = string.Empty;

    public string Search { get; init; } = string.Empty;

    public string State { get; init; } = string.Empty;

    public List<string> StatusKeys { get; init; } = [];

    public List<string> LabelNames { get; init; } = [];
}
