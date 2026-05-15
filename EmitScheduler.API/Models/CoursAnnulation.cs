using System.ComponentModel.DataAnnotations;

namespace EmitScheduler.API.Models;

public class CoursAnnulation
{
    [Key]
    public int Id { get; set; }
    
    public int EmploiDuTempsId { get; set; }
    public EmploiDuTemps EmploiDuTemps { get; set; } = null!;
    
    public int ProfesseurId { get; set; }
    public Professeur Professeur { get; set; } = null!;
    
    [Required]
    public string Motif { get; set; } = string.Empty;
    
    public DateTime DateDemande { get; set; } = DateTime.UtcNow;
    
    public string Statut { get; set; } = "En attente"; 
    
    public DateTime? DateTraitement { get; set; }
    
    public int? TraiteParAdminId { get; set; }
    public User? TraiteParAdmin { get; set; }
    
    public string? CommentaireAdmin { get; set; }
}