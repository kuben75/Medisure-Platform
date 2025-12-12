using System.Collections.Concurrent;

namespace backend.Services;

public class UserConnectionManager
{
    private static readonly ConcurrentDictionary<string, List<string>> UserConnections = new();
    
    private static readonly ConcurrentDictionary<string, string> ConnectionToUserMap = new();
    public void KeepUserConnection(string userId, string connectionId)
    {
        userId = userId.ToLower();

        if (!UserConnections.ContainsKey(userId))
            UserConnections[userId] = new List<string>();
        
        
        if (!UserConnections[userId].Contains(connectionId))
            UserConnections[userId].Add(connectionId);
        

        ConnectionToUserMap[connectionId] = userId;
    }

    public string? RemoveUserConnection(string connectionId)
    {
        if (ConnectionToUserMap.TryRemove(connectionId, out var userId))
        {
            if (UserConnections.ContainsKey(userId))
            {
                UserConnections[userId].Remove(connectionId);
                if (UserConnections[userId].Count == 0)
                {
                    UserConnections.TryRemove(userId, out _);
                    return userId; 
                }
            }
        }
        return null; 
    }

    public List<string> GetUserConnections(string userId)
    {
        userId = userId.ToLower();
        return UserConnections.ContainsKey(userId) ? UserConnections[userId] : new List<string>();
    }

    public List<string> GetOnlineUsers()
    {
        return UserConnections.Keys.ToList();
    }
}