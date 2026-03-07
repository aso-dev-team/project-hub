using System.Security.Claims;
using LinearStyle.Api.Contracts;
using LinearStyle.Api.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LinearStyle.Api.Controllers;

[ApiController]
[Route("api/app/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly IUserSessionService _userSessionService;

    public AuthController(IUserSessionService userSessionService)
    {
        _userSessionService = userSessionService;
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<SessionUserResponse>> GetCurrentUser(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        var user = await _userSessionService.GetUserByIdAsync(userId, cancellationToken);
        return Ok(user.ToResponse());
    }

    [HttpPost("sign-in")]
    [AllowAnonymous]
    public async Task<ActionResult<SessionUserResponse>> SignIn([FromBody] SignInRequest request, CancellationToken cancellationToken)
    {
        var user = await _userSessionService.AuthenticateAsync(request.Email, request.Password, cancellationToken);

        var claims =
            new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id),
                new(ClaimTypes.Name, user.DisplayName),
                new(ClaimTypes.Email, user.Email)
            };

        foreach (var teamId in user.Memberships.Select(membership => membership.TeamId).OrderBy(teamId => teamId))
        {
            claims.Add(new Claim("team_id", teamId));
        }

        var principal = new ClaimsPrincipal(
            new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme));

        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);

        return Ok(user.ToResponse());
    }

    [HttpPost("sign-out")]
    [Authorize]
    public async Task<IActionResult> SignOut(CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return NoContent();
    }
}
