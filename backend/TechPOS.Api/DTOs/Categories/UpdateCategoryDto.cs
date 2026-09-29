using System.ComponentModel.DataAnnotations;

namespace TechPOS.Api.DTOs.Categories;

public class UpdateCategoryDto
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    public bool IsActive { get; set; }
}