namespace EmitScheduler.API.Models;

public class Niveau
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string? Groupe { get; set; }
    public int MentionId { get; set; }
    public Mention Mention { get; set; } = null!;
    public Salle? Salle { get; set; }
    public ICollection<Etudiant> Etudiants { get; set; } = new List<Etudiant>();
    public ICollection<EmploiDuTemps> EmploisDuTemps { get; set; } = new List<EmploiDuTemps>();
    public string Label => Groupe is null ? Code : $"{Code}{Groupe}";
}