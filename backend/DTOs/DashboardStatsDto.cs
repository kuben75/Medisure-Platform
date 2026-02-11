namespace backend.DTOs;

public class DashboardStatsDto
{
    public int TotalUsers { get; set; }
        
    public int TotalPackagesAvailable { get; set; }
    
    public int ActiveSubscriptions { get; set; }
    public int ExpiringSubscriptions { get; set; }
}