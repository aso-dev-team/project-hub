using LinearStyle.Api.Contracts;
using LinearStyle.Api.Data;
using LinearStyle.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace LinearStyle.Api.Services;

public sealed class IssueCommandService : IIssueCommandService
{
    private readonly AppDbContext _dbContext;

    public IssueCommandService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IssueResponse> CreateIssueAsync(
        string userId,
        CreateIssueRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            throw new InvalidOperationException("Issue title is required.");
        }

        var project = await _dbContext.Projects
            .FirstOrDefaultAsync(candidate => candidate.Id == request.ProjectId, cancellationToken)
            ?? throw new InvalidOperationException("Project not found.");

        await EnsureTeamAccessAsync(userId, project.TeamId, cancellationToken);

        if (project.Archived)
        {
            throw new InvalidOperationException("Archived project does not accept new issues.");
        }

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        var nextSequence = await _dbContext.Issues
            .CountAsync(issue => issue.ProjectId == project.Id, cancellationToken) + 1;

        var nextOrder = await _dbContext.Issues
            .CountAsync(issue => issue.ProjectId == project.Id && issue.StatusKey == "todo", cancellationToken) + 1;

        var issue = new Issue
        {
            Id = $"issue-{Guid.NewGuid():N}",
            TeamId = project.TeamId,
            ProjectId = project.Id,
            Identifier = $"{project.Key}-{nextSequence}",
            Title = request.Title.Trim(),
            DescriptionHtml = request.DescriptionHtml,
            State = "open",
            StatusKey = "todo",
            Order = FormatOrder(nextOrder),
            AssigneeUserId = userId,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        _dbContext.Issues.Add(issue);

        var defaultLabel = await _dbContext.Labels
            .FirstOrDefaultAsync(label => label.ProjectId == project.Id && label.Name == "triage", cancellationToken);

        if (defaultLabel is not null)
        {
            _dbContext.IssueLabels.Add(
                new IssueLabel
                {
                    IssueId = issue.Id,
                    LabelId = defaultLabel.Id
                });
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return await LoadIssueResponseAsync(issue.Id, cancellationToken);
    }

    public async Task<IssueResponse> MoveIssueAsync(
        string userId,
        string issueId,
        MoveIssueRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.StatusKey))
        {
            throw new InvalidOperationException("Target status is required.");
        }

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        var issue = await _dbContext.Issues
            .FirstOrDefaultAsync(candidate => candidate.Id == issueId, cancellationToken)
            ?? throw new InvalidOperationException("Issue not found.");

        await EnsureTeamAccessAsync(userId, issue.TeamId, cancellationToken);

        var statusExists = await _dbContext.BoardStatuses.AnyAsync(
            status => status.ProjectId == issue.ProjectId && status.Key == request.StatusKey,
            cancellationToken);

        if (!statusExists)
        {
            throw new InvalidOperationException("The requested status does not exist on the project.");
        }

        var sourceStatusKey = issue.StatusKey;

        var sourceColumnIssues = await _dbContext.Issues
            .Where(candidate => candidate.ProjectId == issue.ProjectId && candidate.StatusKey == sourceStatusKey && candidate.Id != issue.Id)
            .OrderBy(candidate => candidate.Order)
            .ToListAsync(cancellationToken);

        var targetColumnIssues = sourceStatusKey == request.StatusKey
            ? sourceColumnIssues
            : await _dbContext.Issues
                .Where(candidate => candidate.ProjectId == issue.ProjectId && candidate.StatusKey == request.StatusKey && candidate.Id != issue.Id)
                .OrderBy(candidate => candidate.Order)
                .ToListAsync(cancellationToken);

        var beforeIndex = request.BeforeIssueId.Length > 0
            ? targetColumnIssues.FindIndex(candidate => candidate.Id == request.BeforeIssueId)
            : -1;
        var afterIndex = request.AfterIssueId.Length > 0
            ? targetColumnIssues.FindIndex(candidate => candidate.Id == request.AfterIssueId)
            : -1;

        var insertionIndex = beforeIndex >= 0
            ? beforeIndex
            : afterIndex >= 0
                ? afterIndex + 1
                : targetColumnIssues.Count;

        issue.StatusKey = request.StatusKey;
        issue.State = request.StatusKey == "done" ? "closed" : "open";
        issue.UpdatedAt = DateTimeOffset.UtcNow;

        targetColumnIssues.Insert(insertionIndex, issue);
        ReassignDenseOrder(targetColumnIssues);

        if (!string.Equals(sourceStatusKey, request.StatusKey, StringComparison.Ordinal))
        {
            ReassignDenseOrder(sourceColumnIssues);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return await LoadIssueResponseAsync(issue.Id, cancellationToken);
    }

    private async Task EnsureTeamAccessAsync(string userId, string teamId, CancellationToken cancellationToken)
    {
        var hasAccess = await _dbContext.TeamMemberships.AnyAsync(
            membership => membership.UserId == userId && membership.TeamId == teamId,
            cancellationToken);

        if (!hasAccess)
        {
            throw new UnauthorizedAccessException("The requested team is not accessible.");
        }
    }

    private async Task<IssueResponse> LoadIssueResponseAsync(string issueId, CancellationToken cancellationToken)
    {
        var issue = await _dbContext.Issues
            .AsNoTracking()
            .Include(candidate => candidate.Assignee)
            .Include(candidate => candidate.IssueLabels)
            .ThenInclude(link => link.Label)
            .FirstOrDefaultAsync(candidate => candidate.Id == issueId, cancellationToken)
            ?? throw new InvalidOperationException("Issue not found after update.");

        return issue.ToResponse();
    }

    private static void ReassignDenseOrder(IReadOnlyList<Issue> issues)
    {
        for (var index = 0; index < issues.Count; index++)
        {
            issues[index].Order = FormatOrder(index + 1);
        }
    }

    private static string FormatOrder(int ordinal)
    {
        return (ordinal * 1000).ToString("D6");
    }
}
