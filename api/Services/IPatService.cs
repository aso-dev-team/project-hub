using LinearStyle.Api.Domain;

namespace LinearStyle.Api.Services;

public interface IPatService
{
    Task<PatPrincipal> IntrospectAsync(string token, CancellationToken cancellationToken);
}
