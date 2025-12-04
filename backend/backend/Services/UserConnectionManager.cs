using System.Collections.Concurrent;

namespace backend.Services;

public class UserConnectionManager
{
    private static readonly ConcurrentDictionary<string, List<string>> UserConnections = new();

    public void KeepUserConnection(string userId, string connectionId)
    {
        userId = userId.ToLower();
        if (!UserConnections.ContainsKey(userId))
        {
            UserConnections[userId] = new List<string>();
        }

        UserConnections[userId].Add(connectionId);
    }

    public void RemoveUserConnection(string userId, string connectionId)
    {
        userId = userId.ToLower();
        if (UserConnections.ContainsKey(userId))
        {
            UserConnections[userId].Remove(connectionId);
            if (UserConnections[userId].Count == 0)
            {
                UserConnections.TryRemove(userId, out _);
            }
        }
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