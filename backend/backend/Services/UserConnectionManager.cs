using System.Collections.Concurrent;

namespace backend.Services;

public class UserConnectionManager
{
    private readonly ConcurrentDictionary<string, List<string>> _userConnections = new();
    private readonly ConcurrentDictionary<string, string> _connectionToUserMap = new();
    
    private readonly object _lock = new();

    public void KeepUserConnection(string userId, string connectionId)
    {
        var normalizedUserId = userId.ToLower();

        var connections = _userConnections.GetOrAdd(normalizedUserId, _ => new List<string>());

        lock (_lock)
        {
            if (!connections.Contains(connectionId)) connections.Add(connectionId);
            
        }

        _connectionToUserMap[connectionId] = normalizedUserId;
    }

    public string? RemoveUserConnection(string connectionId)
    {
        if (_connectionToUserMap.TryRemove(connectionId, out var userId))
        {
            if (_userConnections.TryGetValue(userId, out var connections))
            {
                lock (_lock)
                {
                    connections.Remove(connectionId);
                    
                    if (connections.Count == 0)
                    {
                        _userConnections.TryRemove(userId, out _);
                        return userId;
                    }
                }
            }
        }
        return null;
    }

    public List<string> GetUserConnections(string userId)
    {
        var normalizedUserId = userId.ToLower();
        
        if (_userConnections.TryGetValue(normalizedUserId, out var connections))
        {
            lock (_lock)
            {
                return new List<string>(connections);
            }
        }

        return new List<string>();
    }

    public List<string> GetOnlineUsers()
    {
        return _userConnections.Keys.ToList();
    }
}