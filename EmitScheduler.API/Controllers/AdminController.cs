using EmitScheduler.API.Data;
using EmitScheduler.API.DTOs;
using EmitScheduler.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmitScheduler.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;
    
    public AdminController(AppDbContext db)
    {
        _db = db;
    }
    
    // ==================== GESTION DES ANNULATIONS ====================
    
    // GET: api/admin/annulations
    [HttpGet("annulations")]
    public async Task<ActionResult<IEnumerable<CoursAnnulationDto>>> GetAnnulationsEnAttente()
    {
        var annulations = await _db.CoursAnnulations
            .Include(ca => ca.EmploiDuTemps)
                .ThenInclude(e => e.Cours)
            .Include(ca => ca.EmploiDuTemps)
                .ThenInclude(e => e.Professeur)
            .Include(ca => ca.EmploiDuTemps)
                .ThenInclude(e => e.Niveau)
                .ThenInclude(n => n.Mention)
            .Where(ca => ca.Statut == "En attente")
            .OrderByDescending(ca => ca.DateDemande)
            .ToListAsync();
        
        return Ok(annulations.Select(ca => new CoursAnnulationDto(
            Id: ca.Id,
            EmploiDuTempsId: ca.EmploiDuTempsId,
            CoursIntitule: ca.EmploiDuTemps.Cours.Intitule,
            ProfesseurNom: $"{ca.EmploiDuTemps.Professeur.Prenom} {ca.EmploiDuTemps.Professeur.Nom}",
            Motif: ca.Motif,
            DateDemande: ca.DateDemande,
            Statut: ca.Statut,
            CommentaireAdmin: ca.CommentaireAdmin,
            Jour: ca.EmploiDuTemps.Jour.ToString(),
            HeureDebut: ca.EmploiDuTemps.HeureDebut.ToString("HH:mm"),
            HeureFin: ca.EmploiDuTemps.HeureFin.ToString("HH:mm")
        )));
    }
    
    // GET: api/admin/annulations/toutes
    [HttpGet("annulations/toutes")]
    public async Task<ActionResult<IEnumerable<CoursAnnulationDto>>> GetAllAnnulations()
    {
        var annulations = await _db.CoursAnnulations
            .Include(ca => ca.EmploiDuTemps)
                .ThenInclude(e => e.Cours)
            .Include(ca => ca.EmploiDuTemps)
                .ThenInclude(e => e.Professeur)
            .OrderByDescending(ca => ca.DateDemande)
            .ToListAsync();
        
        return Ok(annulations.Select(ca => new CoursAnnulationDto(
            Id: ca.Id,
            EmploiDuTempsId: ca.EmploiDuTempsId,
            CoursIntitule: ca.EmploiDuTemps.Cours.Intitule,
            ProfesseurNom: $"{ca.EmploiDuTemps.Professeur.Prenom} {ca.EmploiDuTemps.Professeur.Nom}",
            Motif: ca.Motif,
            DateDemande: ca.DateDemande,
            Statut: ca.Statut,
            CommentaireAdmin: ca.CommentaireAdmin
        )));
    }
    
    // PUT: api/admin/annulations/{id}/traiter
    [HttpPut("annulations/{id:int}/traiter")]
    public async Task<IActionResult> TraiterAnnulation(int id, [FromBody] TraiterAnnulationDto dto)
    {
        var annulation = await _db.CoursAnnulations
            .Include(ca => ca.EmploiDuTemps)
            .FirstOrDefaultAsync(ca => ca.Id == id);
        
        if (annulation == null)
            return NotFound("Demande d'annulation non trouvée");
        
        if (dto.Statut != "Approuvé" && dto.Statut != "Refusé")
            return BadRequest("Le statut doit être 'Approuvé' ou 'Refusé'");
        
        annulation.Statut = dto.Statut;
        annulation.CommentaireAdmin = dto.CommentaireAdmin;
        annulation.DateTraitement = DateTime.UtcNow;
        
        // Récupérer l'admin connecté
        var adminEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        var admin = await _db.Users.FirstOrDefaultAsync(u => u.Email == adminEmail);
        annulation.TraiteParAdminId = admin?.Id;
        
        // Si approuvé, marquer le cours comme annulé (LIBRE)
        if (dto.Statut == "Approuvé")
        {
            annulation.EmploiDuTemps.Statut = StatutCreneau.LIBRE;
        }
        
        await _db.SaveChangesAsync();
        
        return Ok(new { message = $"Annulation {dto.Statut.ToLower()} avec succès" });
    }
    
    // DELETE: api/admin/annulations/{id}
    [HttpDelete("annulations/{id:int}")]
    public async Task<IActionResult> SupprimerAnnulation(int id)
    {
        var annulation = await _db.CoursAnnulations.FindAsync(id);
        if (annulation == null)
            return NotFound();
        
        _db.CoursAnnulations.Remove(annulation);
        await _db.SaveChangesAsync();
        
        return Ok(new { message = "Demande d'annulation supprimée" });
    }
    
    // ==================== VUES ADMIN (EMPLOI DU TEMPS) ====================
    
    // GET: api/admin/emplois-du-temps
    [HttpGet("emplois-du-temps")]
    public async Task<ActionResult<IEnumerable<object>>> GetAllEmploisDuTemps()
    {
        var emplois = await _db.EmploisDuTemps
            .Include(e => e.Niveau).ThenInclude(n => n.Mention)
            .Include(e => e.Professeur)
            .Include(e => e.Cours)
            .Include(e => e.Salle)
            .OrderBy(e => e.Jour)
            .ThenBy(e => e.HeureDebut)
            .Select(e => new
            {
                e.Id,
                Mention = e.Niveau.Mention.Code,
                MentionNom = e.Niveau.Mention.Nom,
                Niveau = e.Niveau.Label,
                Cours = e.Cours.Intitule,
                Professeur = $"{e.Professeur.Prenom} {e.Professeur.Nom}",
                ProfesseurEmail = e.Professeur.Email,
                Salle = e.Salle.Nom,
                Jour = e.Jour.ToString(),
                HeureDebut = e.HeureDebut.ToString("HH:mm"),
                HeureFin = e.HeureFin.ToString("HH:mm"),
                Statut = e.Statut.ToString()
            })
            .ToListAsync();
        
        return Ok(emplois);
    }
    
    // GET: api/admin/emplois-du-temps/professeur/{profId}
    [HttpGet("emplois-du-temps/professeur/{profId:int}")]
    public async Task<ActionResult<object>> GetEmploiDuTempsByProfesseur(int profId)
    {
        var professeur = await _db.Professeurs
            .FirstOrDefaultAsync(p => p.Id == profId);
        
        if (professeur == null)
            return NotFound($"Professeur {profId} introuvable");
        
        var emplois = await _db.EmploisDuTemps
            .Include(e => e.Niveau).ThenInclude(n => n.Mention)
            .Include(e => e.Cours)
            .Include(e => e.Salle)
            .Where(e => e.ProfesseurId == profId)
            .OrderBy(e => e.Jour)
            .ThenBy(e => e.HeureDebut)
            .Select(e => new
            {
                e.Id,
                Mention = e.Niveau.Mention.Code,
                Niveau = e.Niveau.Label,
                Cours = e.Cours.Intitule,
                Salle = e.Salle.Nom,
                Jour = e.Jour.ToString(),
                HeureDebut = e.HeureDebut.ToString("HH:mm"),
                HeureFin = e.HeureFin.ToString("HH:mm"),
                Statut = e.Statut.ToString()
            })
            .ToListAsync();
        
        return Ok(new
        {
            Professeur = new
            {
                professeur.Id,
                professeur.Nom,
                professeur.Prenom,
                professeur.Email
            },
            EmploisDuTemps = emplois,
            TotalCours = emplois.Count
        });
    }
    
    // GET: api/admin/emplois-du-temps/niveau/{niveauId}
    [HttpGet("emplois-du-temps/niveau/{niveauId:int}")]
    public async Task<ActionResult<object>> GetEmploiDuTempsByNiveau(int niveauId)
    {
        var niveau = await _db.Niveaux
            .Include(n => n.Mention)
            .FirstOrDefaultAsync(n => n.Id == niveauId);
        
        if (niveau == null)
            return NotFound($"Niveau {niveauId} introuvable");
        
        var emplois = await _db.EmploisDuTemps
            .Include(e => e.Professeur)
            .Include(e => e.Cours)
            .Include(e => e.Salle)
            .Where(e => e.NiveauId == niveauId)
            .OrderBy(e => e.Jour)
            .ThenBy(e => e.HeureDebut)
            .Select(e => new
            {
                e.Id,
                Professeur = $"{e.Professeur.Prenom} {e.Professeur.Nom}",
                Cours = e.Cours.Intitule,
                Salle = e.Salle.Nom,
                Jour = e.Jour.ToString(),
                HeureDebut = e.HeureDebut.ToString("HH:mm"),
                HeureFin = e.HeureFin.ToString("HH:mm"),
                Statut = e.Statut.ToString()
            })
            .ToListAsync();
        
        return Ok(new
        {
            Niveau = new
            {
                niveau.Id,
                niveau.Code,
                niveau.Groupe,
                niveau.Label,
                Mention = niveau.Mention.Code,
                MentionNom = niveau.Mention.Nom
            },
            EmploisDuTemps = emplois,
            TotalCours = emplois.Count
        });
    }
    
    // ==================== VUES ADMIN (MENTIONS ET NIVEAUX) ====================
    
    // GET: api/admin/mentions/{mentionId}/niveaux
    [HttpGet("mentions/{mentionId:int}/niveaux")]
    public async Task<ActionResult<object>> GetMentionAvecNiveaux(int mentionId)
    {
        var mention = await _db.Mentions
            .Include(m => m.Niveaux)
                .ThenInclude(n => n.Salle)
            .Include(m => m.Niveaux)
                .ThenInclude(n => n.Etudiants)
            .FirstOrDefaultAsync(m => m.Id == mentionId);
        
        if (mention == null)
            return NotFound($"Mention {mentionId} introuvable");
        
        return Ok(new
        {
            mention.Id,
            mention.Code,
            mention.Nom,
            Niveaux = mention.Niveaux.Select(n => new
            {
                n.Id,
                n.Code,
                n.Groupe,
                n.Label,
                Salle = n.Salle?.Nom,
                SalleCapacite = n.Salle?.Capacite,
                NbEtudiants = n.Etudiants.Count
            }).OrderBy(n => n.Code).ThenBy(n => n.Groupe)
        });
    }
    
    // GET: api/admin/toutes-mentions-avec-niveaux
    [HttpGet("toutes-mentions-avec-niveaux")]
    public async Task<ActionResult<IEnumerable<object>>> GetAllMentionsAvecNiveaux()
    {
        var mentions = await _db.Mentions
            .Include(m => m.Niveaux)
                .ThenInclude(n => n.Salle)
            .Include(m => m.Niveaux)
                .ThenInclude(n => n.Etudiants)
            .OrderBy(m => m.Code)
            .ToListAsync();
        
        return Ok(mentions.Select(m => new
        {
            m.Id,
            m.Code,
            m.Nom,
            Niveaux = m.Niveaux.Select(n => new
            {
                n.Id,
                n.Code,
                n.Groupe,
                n.Label,
                Salle = n.Salle?.Nom,
                SalleCapacite = n.Salle?.Capacite,
                NbEtudiants = n.Etudiants.Count
            }).OrderBy(n => n.Code).ThenBy(n => n.Groupe)
        }));
    }
    
    // GET: api/admin/tous-niveaux
    [HttpGet("tous-niveaux")]
    public async Task<ActionResult<IEnumerable<object>>> GetAllNiveauxAvecDetails()
    {
        var niveaux = await _db.Niveaux
            .Include(n => n.Mention)
            .Include(n => n.Salle)
            .Include(n => n.Etudiants)
            .OrderBy(n => n.Mention.Code)
            .ThenBy(n => n.Code)
            .ThenBy(n => n.Groupe)
            .ToListAsync();
        
        return Ok(niveaux.Select(n => new
        {
            n.Id,
            n.Code,
            n.Groupe,
            n.Label,
            Mention = n.Mention.Code,
            MentionNom = n.Mention.Nom,
            Salle = n.Salle?.Nom,
            SalleCapacite = n.Salle?.Capacite,
            NbEtudiants = n.Etudiants.Count
        }));
    }
    
    // ==================== STATISTIQUES ====================
    
    // GET: api/admin/stats
    [HttpGet("stats")]
    [HttpGet("dashboard-stats")] // 💡 Ajout de cet attribut pour corriger l'erreur 404 du frontend !
    public async Task<ActionResult<object>> GetStats()
    {
        var stats = new
        {
            TotalEtudiants = await _db.Etudiants.CountAsync(),
            TotalProfesseurs = await _db.Professeurs.CountAsync(),
            TotalCours = await _db.Cours.CountAsync(),
            TotalSalles = await _db.Salles.CountAsync(),
            TotalMentions = await _db.Mentions.CountAsync(),
            TotalNiveaux = await _db.Niveaux.CountAsync(),
            AnnulationsEnAttente = await _db.CoursAnnulations.CountAsync(ca => ca.Statut == "En attente"),
            AnnulationsApprouvees = await _db.CoursAnnulations.CountAsync(ca => ca.Statut == "Approuvé"),
            AnnulationsRefusees = await _db.CoursAnnulations.CountAsync(ca => ca.Statut == "Refusé"),
            CoursAujourdhui = await _db.EmploisDuTemps
                .CountAsync(e => e.Jour == DateTime.Now.DayOfWeek),
            CoursTotal = await _db.EmploisDuTemps.CountAsync()
        };
        
        return Ok(stats);
    }
    // ==================== AJOUT D'UNE MENTION ====================
    
    // POST: api/admin/mentions
    [HttpPost("mentions")]
    public async Task<IActionResult> CreerMention([FromBody] CreateMentionDto dto)
    {
        try
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Nom) || string.IsNullOrWhiteSpace(dto.Code))
            {
                return BadRequest(new { message = "Le nom et le code de la mention sont obligatoires." });
            }

            // Vérifier si le code existe déjà pour éviter les doublons
            var existeDeja = await _db.Mentions.AnyAsync(m => m.Code.ToLower() == dto.Code.ToLower());
            if (existeDeja)
            {
                return BadRequest(new { message = "Une mention avec ce code existe déjà." });
            }

            // Création de l'entité (À adapter selon ton entité Mention réelle)
            var nouvelleMention = new Mention
            {
                Nom = dto.Nom,
                Code = dto.Code.ToUpper()
            };

            _db.Mentions.Add(nouvelleMention);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Mention créée avec succès !", id = nouvelleMention.Id });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erreur interne du serveur", error = ex.Message });
        }
    }
}