
namespace backend.Models;

public class Package
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Price { get; set; }
    public List<string> Features { get; set; }
    public string Description {get; set; }
    public double AverageRating { get; set; }
    public int Reviews { get; set; }
    public bool? IsFeatured { get; set; }
}