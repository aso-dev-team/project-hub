using LinearStyle.Api.Contracts;

namespace LinearStyle.Api.Services;

public interface IIssueCommandService
{
    Task<IssueResponse> CreateIssueAsync(string userId, CreateIssueRequest request, CancellationToken cancellationToken);

    Task<IssueResponse> MoveIssueAsync(string userId, string issueId, MoveIssueRequest request, CancellationToken cancellationToken);
}
