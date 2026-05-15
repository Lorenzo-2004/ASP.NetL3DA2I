namespace EmitScheduler.API.Models;

public class Mention
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Nom { get; set; } = string.Empty;
    public ICollection<Niveau> Niveaux { get; set; } = new List<Niveau>();
    public ICollection<ProfesseurMention> ProfesseurMentions { get; set; } = new List<ProfesseurMention>();
}