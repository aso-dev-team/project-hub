namespace LinearStyle.Api.Services;

public interface IRealtimeNotifier
{
    Task NotifyBoardChangedAsync(string projectId, string reason, CancellationToken cancellationToken);
}
