namespace TechPOS.Api.DTOs.Categories;

public class CategoryQueryDto
{
    private int _page = 1;
    private int _pageSize = 10;
    public int Page { get => _page; set => _page = value < 1 ? 1 : value; }
    public int PageSize { get => _pageSize; set => _pageSize = value switch { < 1 => 10, > 100 => 100, _ => value }; }
    public string? Search { get; set; }
    public bool? IsActive { get; set; }
}
