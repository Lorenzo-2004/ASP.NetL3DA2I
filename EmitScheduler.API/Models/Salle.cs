namespace EmitScheduler.API.Models;

public class Salle
{
    public int Id { get; set; }
    public string Nom { get; set; } = string.Empty;
    public int Capacite { get; set; }
    public int NiveauId { get; set; }
    public Niveau Niveau { get; set; } = null!;
    public ICollection<EmploiDuTemps> EmploisDuTemps { get; set; } = new List<EmploiDuTemps>();
}