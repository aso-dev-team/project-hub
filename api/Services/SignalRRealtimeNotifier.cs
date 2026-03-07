using LinearStyle.Api.Contracts;
using LinearStyle.Api.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace LinearStyle.Api.Services;

public sealed class SignalRRealtimeNotifier : IRealtimeNotifier
{
    private readonly IHubContext<BoardHub> _hubContext;

    public SignalRRealtimeNotifier(IHubContext<BoardHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public Task NotifyBoardChangedAsync(string projectId, string reason, CancellationToken cancellationToken)
    {
        return _hubContext
            .Clients
            .Group(projectId)
            .SendAsync(
                "BoardChanged",
                new BoardChangedMessage
                {
                    ProjectId = projectId,
                    Reason = reason,
                    OccurredAt = DateTimeOffset.UtcNow
                },
                cancellationToken);
    }
}
