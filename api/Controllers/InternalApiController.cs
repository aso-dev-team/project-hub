using LinearStyle.Api.Contracts;
using LinearStyle.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace LinearStyle.Api.Controllers;

// Go の ext-api から参照される内部専用エンドポイントです。ドメインの正は常に ASP.NET Core 側に置きます。
[ApiController]
[ApiExplorerSettings(IgnoreApi = true)]
[Route("internal")]
public sealed class InternalApiController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly IBoardQueryService _boardQueryService;
    private readonly IPatService _patService;

    public InternalApiController(
        IConfiguration configuration,
        IBoardQueryService boardQueryService,
        IPatService patService)
    {
        _configuration = configuration;
        _boardQueryService = boardQueryService;
        _patService = patService;
    }

    [HttpPost("auth/pat/introspect")]
    public async Task<ActionResult<PatIntrospectionResponse>> IntrospectPat(
        [FromBody] PatIntrospectionRequest request,
        CancellationToken cancellationToken)
    {
        EnsureInternalAccess();
        var principal = await _patService.IntrospectAsync(request.Token, cancellationToken);
        return Ok(principal.ToResponse());
    }

    [HttpGet("ext/teams")]
    public async Task<ActionResult<IReadOnlyList<TeamSummaryResponse>>> GetTeams(
        [FromQuery] string userId,
        CancellationToken cancellationToken)
    {
        EnsureInternalAccess();
        var teams = await _boardQueryService.GetTeamsForUserAsync(userId, cancellationToken);
        return Ok(teams);
    }

    [HttpGet("ext/projects")]
    public async Task<ActionResult<IReadOnlyList<ProjectSummaryResponse>>> GetProjects(
        [FromQuery] string userId,
        [FromQuery] string teamId,
        CancellationToken cancellationToken)
    {
        EnsureInternalAccess();
        var projects = await _boardQueryService.GetProjectsForUserAsync(userId, teamId, cancellationToken);
        return Ok(projects);
    }

    [HttpGet("ext/issues")]
    public async Task<ActionResult<IReadOnlyList<IssueResponse>>> GetIssues(
        [FromQuery] string userId,
        [FromQuery] string teamId,
        [FromQuery] string projectId,
        [FromQuery] string search,
        CancellationToken cancellationToken)
    {
        EnsureInternalAccess();
        var issues = await _boardQueryService.SearchIssuesAsync(
            userId,
            new IssueSearchRequest
            {
                TeamId = teamId,
                ProjectId = projectId,
                Search = search
            },
            cancellationToken);

        return Ok(issues);
    }

    private void EnsureInternalAccess()
    {
        var expectedKey = _configuration["Demo:InternalServiceApiKey"] ?? string.Empty;
        var providedKey = Request.Headers["X-Internal-Service-Key"].ToString();

        if (!string.Equals(expectedKey, providedKey, StringComparison.Ordinal))
        {
            throw new UnauthorizedAccessException("The internal service key is invalid.");
        }
    }
}
