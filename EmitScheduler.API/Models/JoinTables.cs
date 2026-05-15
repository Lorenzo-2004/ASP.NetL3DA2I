namespace EmitScheduler.API.Models;

public class ProfesseurMention
{
    public int ProfesseurId { get; set; }
    public Professeur Professeur { get; set; } = null!;
    public int MentionId { get; set; }
    public Mention Mention { get; set; } = null!;
}

public class ProfesseurCours
{
    public int ProfesseurId { get; set; }
    public Professeur Professeur { get; set; } = null!;
    public int CoursId { get; set; }
    public Cours Cours { get; set; } = null!; 
}
