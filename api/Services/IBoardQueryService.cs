using LinearStyle.Api.Contracts;

namespace LinearStyle.Api.Services;

public interface IBoardQueryService
{
    Task<BoardResponse> GetBoardAsync(string userId, string teamId, string projectId, CancellationToken cancellationToken);

    Task<IReadOnlyList<TeamSummaryResponse>> GetTeamsForUserAsync(string userId, CancellationToken cancellationToken);

    Task<IReadOnlyList<ProjectSummaryResponse>> GetProjectsForUserAsync(
        string userId,
        string teamId,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<IssueResponse>> SearchIssuesAsync(
        string userId,
        IssueSearchRequest request,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<TimelineItemResponse>> GetTimelineAsync(
        string userId,
        string teamId,
        string projectId,
        CancellationToken cancellationToken);
}
