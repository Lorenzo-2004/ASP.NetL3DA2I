using EmitScheduler.API.Models;  // Ajoutez cette ligne en haut

namespace EmitScheduler.API.Models;

public class Professeur
{
    public int Id { get; set; }
    public string Nom { get; set; } = string.Empty;
    public string Prenom { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    
    public User? User { get; set; }
    
    public ICollection<ProfesseurMention> ProfesseurMentions { get; set; } = new List<ProfesseurMention>();
    public ICollection<ProfesseurCours> ProfesseurCours { get; set; } = new List<ProfesseurCours>();
    public ICollection<EmploiDuTemps> EmploisDuTemps { get; set; } = new List<EmploiDuTemps>();
}