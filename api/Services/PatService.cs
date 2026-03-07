using System.Security.Cryptography;
using System.Text;
using LinearStyle.Api.Data;
using LinearStyle.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace LinearStyle.Api.Services;

public sealed class PatService : IPatService
{
    private readonly AppDbContext _dbContext;

    public PatService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PatPrincipal> IntrospectAsync(string token, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            throw new UnauthorizedAccessException("PAT is required.");
        }

        var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
        var pat = await _dbContext.PersonalAccessTokens
            .Include(candidate => candidate.User)
            .ThenInclude(user => user.Memberships)
            .FirstOrDefaultAsync(candidate => candidate.Hash == hash, cancellationToken)
            ?? throw new UnauthorizedAccessException("PAT is invalid.");

        if (pat.RevokedAt.HasValue)
        {
            throw new UnauthorizedAccessException("PAT has been revoked.");
        }

        if (pat.ExpiresAt.HasValue && pat.ExpiresAt.Value <= DateTimeOffset.UtcNow)
        {
            throw new UnauthorizedAccessException("PAT has expired.");
        }

        pat.LastUsedAt = DateTimeOffset.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new PatPrincipal
        {
            UserId = pat.User.Id,
            DisplayName = pat.User.DisplayName,
            Scopes = [.. pat.Scopes],
            TeamIds = [.. pat.User.Memberships.Select(membership => membership.TeamId)]
        };
    }
}
