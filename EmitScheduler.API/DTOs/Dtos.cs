namespace EmitScheduler.API.DTOs;

// ── MENTION ───────────────────────────────────────────────────────────────────
public record MentionDto(int Id, string Code, string Nom);
public record CreateMentionDto(string Code, string Nom);

// ── NIVEAU ────────────────────────────────────────────────────────────────────
public record NiveauDto(int Id, string Code, string? Groupe, string Label, int MentionId, string MentionCode);
public record CreateNiveauDto(string Code, string? Groupe, int MentionId);

// ── SALLE ─────────────────────────────────────────────────────────────────────
public record SalleDto(int Id, string Nom, int Capacite, int NiveauId, string NiveauLabel);
public record CreateSalleDto(string Nom, int Capacite, int NiveauId);

// ── PROFESSEUR ────────────────────────────────────────────────────────────────
public record ProfesseurDto(int Id, string Nom, string Prenom, string Email, List<string> Mentions, List<string> Cours);
public record CreateProfesseurDto(string Nom, string Prenom, string Email, List<int> MentionIds, List<int> CoursIds);

// ── COURS ─────────────────────────────────────────────────────────────────────
public record CoursDto(int Id, string Intitule, string Description, string Professeur, string Salle, string Statut);
public record CreateCoursDto(
    string Intitule,
    string Description,
    int ProfesseurId,
    int NiveauId,
    int SalleId,
    int Jour, // 0 pour Dimanche, 1 pour Lundi, etc.
    TimeSpan HeureDebut, // Le JSON enverra "08:00:00"
    TimeSpan HeureFin
);

// ── ETUDIANT ──────────────────────────────────────────────────────────────────
public record EtudiantDto(
    int Id, 
    string Nom, 
    string Prenom, 
    string NumeroEtudiant, 
    string Email,           
    int NiveauId, 
    string NiveauLabel,     
    int MentionId,
    string MentionNom
);
public record CreateEtudiantDto(
    string Nom, 
    string Prenom, 
    string NumeroEtudiant, 
    string Email,         
    int NiveauId
); 

// ── EMPLOI DU TEMPS ───────────────────────────────────────────────────────────
public record EmploiDuTempsDto(
    int Id, string Mention, string Niveau, string Cours,
    string Professeur, string Salle, string Jour,
    string HeureDebut, string HeureFin, string Statut);

public record CreateEmploiDuTempsDto(
    int NiveauId, int ProfesseurId, int CoursId, int SalleId,
    int Jour, string HeureDebut, string HeureFin);

/// <summary>
/// Pour créer un cours L1A+L1B ensemble (même prof, même horaire, salles séparées).
/// </summary>
public record CreateEmploiDuTempsGroupeDto(
    int MentionId,      // La mention (DA2I, AES, ICM)
    int ProfesseurId,
    int CoursId,
    int SalleIdA,       // Salle pour L1A
    int SalleIdB,       // Salle pour L1B
    int Jour,
    string HeureDebut,
    string HeureFin);

// ── DISPONIBILITE ─────────────────────────────────────────────────────────────
public record DisponibiliteDto(
    string Type, string Nom, string Statut,
    string? CoursEnCours, string? HeureDebut, string? HeureFin);

// ── COURS ANNULATION ──────────────────────────────────────────────────────────
public record CoursAnnulationDto(
    int Id,
    int EmploiDuTempsId,
    string CoursIntitule,
    string ProfesseurNom,
    string Motif,
    DateTime DateDemande,
    string Statut,
    string? CommentaireAdmin = null,
    string? Jour = null,
    string? HeureDebut = null,
    string? HeureFin = null);

public record CreateAnnulationDto(
    string Motif);

public record TraiterAnnulationDto(
    string Statut,      // "Approuvé" ou "Refusé"
    string? CommentaireAdmin = null);

// ── COURS DETAILS (pour étudiants) ────────────────────────────────────────────
public record CoursDetailsDto(
    int Id,
    string Intitule,
    string? Description,
    string Professeur,
    string? ProfesseurEmail,
    string Salle,
    string Horaire,
    string Jour,
    string Niveau);

// ── AUTHENTIFICATION ──────────────────────────────────────────────────────────
public record RegisterRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string? Role = "Etudiant");

public record LoginRequest(
    string Email,
    string Password);