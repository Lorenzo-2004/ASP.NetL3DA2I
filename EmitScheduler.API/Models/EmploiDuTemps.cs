namespace EmitScheduler.API.Models;

public enum StatutCreneau { LIBRE, OCCUPE }

public class EmploiDuTemps
{
    public int Id { get; set; }
    public int NiveauId { get; set; }
    public Niveau Niveau { get; set; } = null!;
    public int ProfesseurId { get; set; }
    public Professeur Professeur { get; set; } = null!;
    public int CoursId { get; set; }
    public Cours Cours { get; set; } = null!;
    public int SalleId { get; set; }
    public Salle Salle { get; set; } = null!;
    public DayOfWeek Jour { get; set; }
    public TimeOnly HeureDebut { get; set; }
    public TimeOnly HeureFin { get; set; }
    public StatutCreneau Statut { get; set; } = StatutCreneau.LIBRE;
}