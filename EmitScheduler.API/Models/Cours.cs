namespace EmitScheduler.API.Models;

public class Cours
{
    public int Id { get; set; }
    public string Intitule { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ICollection<ProfesseurCours> ProfesseurCours { get; set; } = new List<ProfesseurCours>();
    public ICollection<EmploiDuTemps> EmploisDuTemps { get; set; } = new List<EmploiDuTemps>();
}