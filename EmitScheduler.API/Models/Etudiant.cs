using EmitScheduler.API.Models;  

namespace EmitScheduler.API.Models;

public class Etudiant
{
    public int Id { get; set; }
    public string Nom { get; set; } = string.Empty;
    public string Prenom { get; set; } = string.Empty;
    public string NumeroEtudiant { get; set; } = string.Empty;
    public int NiveauId { get; set; }
    public Niveau Niveau { get; set; } = null!;
    public string? Email { get; set; }
    
    public User? User { get; set; }
}