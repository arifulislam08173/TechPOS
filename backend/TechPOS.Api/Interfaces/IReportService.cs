using TechPOS.Api.DTOs.Reports;

namespace TechPOS.Api.Interfaces;

public interface IReportService
{
    Task<DashboardSummaryDto> GetDashboardAsync(CancellationToken cancellationToken = default);
    Task<ReportOverviewDto> GetOverviewAsync(DateOnly? fromDate, DateOnly? toDate, CancellationToken cancellationToken = default);
}
