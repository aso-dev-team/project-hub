using LinearStyle.Api.Contracts;
using LinearStyle.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace LinearStyle.Api.Services;

// read を QueryService に寄せることで、必要になった時点で EF 実装を Dapper 実装へ差し替えやすくしています。
public sealed class BoardQueryService : IBoardQueryService
{
    private readonly AppDbContext _dbContext;

    public BoardQueryService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<BoardResponse> GetBoardAsync(
        string userId,
        string teamId,
        string projectId,
        CancellationToken cancellationToken)
    {
        var accessibleTeamIds = await ResolveAccessibleTeamIdsAsync(userId, teamId, cancellationToken);
        var resolvedTeamId = teamId.Length > 0 ? teamId : accessibleTeamIds.FirstOrDefault() ?? string.Empty;

        if (resolvedTeamId.Length == 0)
        {
            throw new UnauthorizedAccessException("No accessible team was found for the current user.");
        }

        var activeTeam = await _dbContext.Teams
            .AsNoTracking()
            .Include(team => team.Workspace)
            .FirstOrDefaultAsync(team => team.Id == resolvedTeamId, cancellationToken)
            ?? throw new InvalidOperationException("Team not found.");

        var scopedProjects = await _dbContext.Projects
            .AsNoTracking()
            .Where(project => project.TeamId == resolvedTeamId && !project.Archived)
            .OrderBy(project => project.Name)
            .ToListAsync(cancellationToken);

        var activeProject = scopedProjects.FirstOrDefault(project => project.Id == projectId)
            ?? scopedProjects.FirstOrDefault()
            ?? throw new InvalidOperationException("Project not found.");

        var issueCounts = await _dbContext.Issues
            .AsNoTracking()
            .Where(issue => issue.TeamId == resolvedTeamId)
            .GroupBy(issue => issue.ProjectId)
            .Select(group => new { ProjectId = group.Key, Count = group.Count() })
            .ToDictionaryAsync(group => group.ProjectId, group => group.Count, cancellationToken);

        var statuses = await _dbContext.BoardStatuses
            .AsNoTracking()
            .Where(status => status.ProjectId == activeProject.Id)
            .OrderBy(status => status.Order)
            .ToListAsync(cancellationToken);

        var issues = await _dbContext.Issues
            .AsNoTracking()
            .Where(issue => issue.ProjectId == activeProject.Id)
            .Include(issue => issue.Assignee)
            .Include(issue => issue.IssueLabels)
            .ThenInclude(issueLabel => issueLabel.Label)
            .OrderBy(issue => issue.StatusKey)
            .ThenBy(issue => issue.Order)
            .ToListAsync(cancellationToken);

        var response = new BoardResponse
        {
            WorkspaceName = activeTeam.Workspace.Name,
            ActiveTeam = activeTeam.ToSummary(),
            ActiveProject = activeProject.ToSummary(issueCounts.GetValueOrDefault(activeProject.Id))
        };

        response.Projects.AddRange(scopedProjects.Select(project => project.ToSummary(issueCounts.GetValueOrDefault(project.Id))));
        response.Statuses.AddRange(statuses.Select(status => status.ToResponse()));
        response.Issues.AddRange(issues.Select(issue => issue.ToResponse()));

        return response;
    }

    public async Task<IReadOnlyList<TeamSummaryResponse>> GetTeamsForUserAsync(
        string userId,
        CancellationToken cancellationToken)
    {
        var teams = await _dbContext.TeamMemberships
            .AsNoTracking()
            .Where(membership => membership.UserId == userId)
            .Select(membership => membership.Team)
            .OrderBy(team => team.Name)
            .ToListAsync(cancellationToken);

        return teams.Select(team => team.ToSummary()).ToList();
    }

    public async Task<IReadOnlyList<ProjectSummaryResponse>> GetProjectsForUserAsync(
        string userId,
        string teamId,
        CancellationToken cancellationToken)
    {
        var accessibleTeamIds = await ResolveAccessibleTeamIdsAsync(userId, teamId, cancellationToken);

        var projects = await _dbContext.Projects
            .AsNoTracking()
            .Where(project => accessibleTeamIds.Contains(project.TeamId) && !project.Archived)
            .OrderBy(project => project.Name)
            .ToListAsync(cancellationToken);

        var issueCounts = await _dbContext.Issues
            .AsNoTracking()
            .Where(issue => accessibleTeamIds.Contains(issue.TeamId))
            .GroupBy(issue => issue.ProjectId)
            .Select(group => new { ProjectId = group.Key, Count = group.Count() })
            .ToDictionaryAsync(group => group.ProjectId, group => group.Count, cancellationToken);

        return projects.Select(project => project.ToSummary(issueCounts.GetValueOrDefault(project.Id))).ToList();
    }

    public async Task<IReadOnlyList<IssueResponse>> SearchIssuesAsync(
        string userId,
        IssueSearchRequest request,
        CancellationToken cancellationToken)
    {
        var accessibleTeamIds = await ResolveAccessibleTeamIdsAsync(userId, request.TeamId, cancellationToken);

        var query = _dbContext.Issues
            .AsNoTracking()
            .Where(issue => accessibleTeamIds.Contains(issue.TeamId))
            .Include(issue => issue.Assignee)
            .Include(issue => issue.IssueLabels)
            .ThenInclude(issueLabel => issueLabel.Label)
            .AsQueryable();

        if (request.ProjectId.Length > 0)
        {
            query = query.Where(issue => issue.ProjectId == request.ProjectId);
        }

        if (request.State.Length > 0)
        {
            query = query.Where(issue => issue.State == request.State);
        }

        if (request.StatusKeys.Count > 0)
        {
            query = query.Where(issue => request.StatusKeys.Contains(issue.StatusKey));
        }

        if (request.LabelNames.Count > 0)
        {
            query = query.Where(issue => issue.IssueLabels.Any(link => request.LabelNames.Contains(link.Label.Name)));
        }

        if (request.Search.Length > 0)
        {
            var searchPattern = $"%{request.Search.Trim()}%";
            query = query.Where(
                issue =>
                    EF.Functions.ILike(issue.Title, searchPattern)
                    || EF.Functions.ILike(issue.DescriptionHtml, searchPattern));
        }

        var issues = request.ProjectId.Length > 0
            ? await query.OrderBy(issue => issue.StatusKey).ThenBy(issue => issue.Order).ToListAsync(cancellationToken)
            : await query.OrderByDescending(issue => issue.UpdatedAt).ToListAsync(cancellationToken);

        return issues.Select(issue => issue.ToResponse()).ToList();
    }

    public async Task<IReadOnlyList<TimelineItemResponse>> GetTimelineAsync(
        string userId,
        string teamId,
        string projectId,
        CancellationToken cancellationToken)
    {
        var accessibleTeamIds = await ResolveAccessibleTeamIdsAsync(userId, teamId, cancellationToken);

        var issues = await _dbContext.Issues
            .AsNoTracking()
            .Where(issue => accessibleTeamIds.Contains(issue.TeamId))
            .Where(issue => projectId.Length == 0 || issue.ProjectId == projectId)
            .OrderBy(issue => issue.StartsAt ?? issue.CreatedAt)
            .ThenBy(issue => issue.TargetDate ?? issue.UpdatedAt)
            .ToListAsync(cancellationToken);

        return issues.Select(issue => issue.ToTimelineResponse()).ToList();
    }

    private async Task<List<string>> ResolveAccessibleTeamIdsAsync(
        string userId,
        string requestedTeamId,
        CancellationToken cancellationToken)
    {
        if (requestedTeamId.Length > 0)
        {
            var hasAccess = await _dbContext.TeamMemberships
                .AsNoTracking()
                .AnyAsync(
                    membership => membership.UserId == userId && membership.TeamId == requestedTeamId,
                    cancellationToken);

            if (!hasAccess)
            {
                throw new UnauthorizedAccessException("The requested team is not accessible.");
            }

            return [requestedTeamId];
        }

        return await _dbContext.TeamMemberships
            .AsNoTracking()
            .Where(membership => membership.UserId == userId)
            .Select(membership => membership.TeamId)
            .OrderBy(teamId => teamId)
            .ToListAsync(cancellationToken);
    }
}
