using Xunit;
using FluentAssertions;
using backend.Services;


namespace backend.backend.Tests;
    public class UserConnectionManagerTests
    {
        [Fact]
        public void KeepUserConnection_ShouldAddUserToOnlineList()
        {
            var manager = new UserConnectionManager();
            string userId = "user-" + Guid.NewGuid().ToString(); 
            string connectionId = "conn-" + Guid.NewGuid().ToString();

            manager.KeepUserConnection(userId, connectionId);

            var onlineUsers = manager.GetOnlineUsers();
            onlineUsers.Should().Contain(userId.ToLower()); 

            var connections = manager.GetUserConnections(userId);
            connections.Should().Contain(connectionId); 
        }

        [Fact]
        public void KeepUserConnection_ShouldStoreMultipleConnections_ForSameUser()
        {
            var manager = new UserConnectionManager();
            string userId = "multi-device-user-" + Guid.NewGuid().ToString();
            string connectionId1 = "mobile-" + Guid.NewGuid().ToString();
            string connectionId2 = "desktop-" + Guid.NewGuid().ToString();

            manager.KeepUserConnection(userId, connectionId1);
            manager.KeepUserConnection(userId, connectionId2);

            var connections = manager.GetUserConnections(userId);
            
            connections.Should().HaveCount(2); 
            connections.Should().Contain(connectionId1);
            connections.Should().Contain(connectionId2);
        }

        [Fact]
        public void KeepUserConnection_ShouldBeCaseInsensitive()
        {
            var manager = new UserConnectionManager();
            string rawUserId = "JanKowalski@Gmail.Com-" + Guid.NewGuid().ToString();
            string connectionId = "conn-" + Guid.NewGuid().ToString();
            manager.KeepUserConnection(rawUserId, connectionId);

           
            var connections = manager.GetUserConnections(rawUserId.ToLower());
            connections.Should().Contain(connectionId);
        }

        [Fact]
        public void RemoveUserConnection_ShouldRemoveUser_WhenLastConnectionClosed()
        {
            var manager = new UserConnectionManager();
            string userId = "leaving-user-" + Guid.NewGuid().ToString();
            string connectionId = "conn-to-remove-" + Guid.NewGuid().ToString();

            manager.KeepUserConnection(userId, connectionId);

     
            var removedUserId = manager.RemoveUserConnection(connectionId);


            removedUserId.Should().Be(userId.ToLower());

            var connections = manager.GetUserConnections(userId);
            connections.Should().BeEmpty();

            manager.GetOnlineUsers().Should().NotContain(userId.ToLower());
        }
    }
