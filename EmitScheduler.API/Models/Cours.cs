namespace EmitScheduler.API.Models;

public class Cours 
{
    public int Id { get; set; }
    public string Intitule { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    // Ajoutez ces deux lignes manquantes
    public int NiveauId { get; set; }
    public Niveau Niveau { get; set; } = null!; 

    public ICollection<ProfesseurCours> ProfesseurCours { get; set; } = new List<ProfesseurCours>();
    public ICollection<EmploiDuTemps> EmploisDuTemps { get; set; } = new List<EmploiDuTemps>();
}