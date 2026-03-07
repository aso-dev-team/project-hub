using LinearStyle.Api.Data;
using LinearStyle.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace LinearStyle.Api.Services;

public sealed class UserSessionService : IUserSessionService
{
    private readonly AppDbContext _dbContext;
    private readonly IPasswordHasher _passwordHasher;

    public UserSessionService(AppDbContext dbContext, IPasswordHasher passwordHasher)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
    }

    public async Task<UserAccount> AuthenticateAsync(string email, string password, CancellationToken cancellationToken)
    {
        var normalizedEmail = NormalizeEmail(email);

        var user = await _dbContext.Users
            .Include(candidate => candidate.Memberships)
            .FirstOrDefaultAsync(candidate => candidate.NormalizedEmail == normalizedEmail, cancellationToken);

        if (user is null || !_passwordHasher.Verify(user.PasswordHash, password))
        {
            throw new UnauthorizedAccessException("Email または password が正しくありません。");
        }

        return user;
    }

    public async Task<UserAccount> GetUserByIdAsync(string userId, CancellationToken cancellationToken)
    {
        var user = await _dbContext.Users
            .Include(candidate => candidate.Memberships)
            .FirstOrDefaultAsync(candidate => candidate.Id == userId, cancellationToken);

        return user ?? throw new UnauthorizedAccessException("User not found.");
    }

    private static string NormalizeEmail(string email)
    {
        return email.Trim().ToUpperInvariant();
    }
}
