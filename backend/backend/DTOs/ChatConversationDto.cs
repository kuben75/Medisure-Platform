namespace backend.DTOs;

public class ChatConversationDto
{
    public string Email { get; set; }
    
    public string FirstName { get; set; }
    
    public string LastName { get; set; }
    
    public string LastMessage { get; set; }
    
    public DateTime LastMessageDate { get; set; }
    
    public int UnreadCount { get; set; }
    
    public bool IsOnline { get; set; }
}

public class MarkReadDto
{
    public string UserEmail { get; set; }
}