using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace LinearStyle.Api.Hubs;

[Authorize]
public sealed class BoardHub : Hub
{
    public Task JoinProject(string projectId)
    {
        return Groups.AddToGroupAsync(Context.ConnectionId, projectId);
    }

    public Task LeaveProject(string projectId)
    {
        return Groups.RemoveFromGroupAsync(Context.ConnectionId, projectId);
    }
}
