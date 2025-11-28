using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/admin/logs")]
[Authorize(Roles = "Admin")]
public class LogsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public LogsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetLogs(
        [FromQuery] string search = "",
        [FromQuery] string level = "")
    {
        var query = _context.SystemLogs.AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            search = search.ToLower();
            query = query.Where(l =>
                l.Action.ToLower().Contains(search) ||
                l.Description.ToLower().Contains(search) ||
                l.UserName.ToLower().Contains(search));
        }

        if (!string.IsNullOrEmpty(level) && level != "All")
        {
            query = query.Where(l => l.Level == level);
        }

        var logs = await query
            .OrderByDescending(l => l.CreatedAt)
            .Take(100)
            .ToListAsync();

        return Ok(logs);
    }
}