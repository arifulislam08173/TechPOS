using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechPOS.Api.Helpers;
using TechPOS.Api.Interfaces;

namespace TechPOS.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [Authorize(Policy = PermissionCodes.DashboardView)]
    [HttpGet("dashboard")]
    public async Task<ActionResult> Dashboard(CancellationToken cancellationToken) =>
        Ok(await _reportService.GetDashboardAsync(cancellationToken));

    [Authorize(Policy = PermissionCodes.ReportsView)]
    [HttpGet("overview")]
    public async Task<ActionResult> Overview(
        [FromQuery] DateOnly? fromDate,
        [FromQuery] DateOnly? toDate,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _reportService.GetOverviewAsync(fromDate, toDate, cancellationToken));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
