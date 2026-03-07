using LinearStyle.Api.Domain;

namespace LinearStyle.Api.Services;

public interface IUserSessionService
{
    Task<UserAccount> AuthenticateAsync(string email, string password, CancellationToken cancellationToken);

    Task<UserAccount> GetUserByIdAsync(string userId, CancellationToken cancellationToken);
}
