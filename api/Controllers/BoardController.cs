using System.Security.Claims;
using LinearStyle.Api.Contracts;
using LinearStyle.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LinearStyle.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/app")]
public sealed class BoardController : ControllerBase
{
    private readonly IIssueCommandService _issueCommandService;
    private readonly IBoardQueryService _boardQueryService;
    private readonly IRealtimeNotifier _realtimeNotifier;

    public BoardController(
        IBoardQueryService boardQueryService,
        IIssueCommandService issueCommandService,
        IRealtimeNotifier realtimeNotifier)
    {
        _boardQueryService = boardQueryService;
        _issueCommandService = issueCommandService;
        _realtimeNotifier = realtimeNotifier;
    }

    [HttpGet("board")]
    public async Task<ActionResult<BoardResponse>> GetBoard(
        [FromQuery] string teamId,
        [FromQuery] string projectId,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        var board = await _boardQueryService.GetBoardAsync(userId, teamId, projectId, cancellationToken);
        return Ok(board);
    }

    [HttpPost("issues")]
    public async Task<ActionResult<IssueResponse>> CreateIssue(
        [FromBody] CreateIssueRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        var issue = await _issueCommandService.CreateIssueAsync(userId, request, cancellationToken);

        await _realtimeNotifier.NotifyBoardChangedAsync(issue.ProjectId, "issue.created", cancellationToken);

        return Ok(issue);
    }

    [HttpPost("issues/{issueId}/move")]
    public async Task<ActionResult<IssueResponse>> MoveIssue(
        string issueId,
        [FromBody] MoveIssueRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        var issue = await _issueCommandService.MoveIssueAsync(userId, issueId, request, cancellationToken);

        await _realtimeNotifier.NotifyBoardChangedAsync(issue.ProjectId, "issue.moved", cancellationToken);

        return Ok(issue);
    }
}
