using EmitScheduler.API.Data;
using EmitScheduler.API.DTOs;
using EmitScheduler.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmitScheduler.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmploiDuTempsController : ControllerBase
{
    private readonly AppDbContext _db;
    public EmploiDuTempsController(AppDbContext db) => _db = db;

    // ==================== EXISTANTS ====================

    // GET api/emploidutemps
    [HttpGet]
    [Authorize(Roles = "Admin,Professeur")]
    public async Task<ActionResult<IEnumerable<EmploiDuTempsDto>>> GetAll()
    {
        var now = DateTime.Now;
        return Ok((await QueryBase().ToListAsync()).Select(e => Map(e, now)));
    }

    // GET api/emploidutemps/niveau/3
    [HttpGet("niveau/{niveauId:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<EmploiDuTempsDto>>> GetByNiveau(int niveauId)
    {
        var now = DateTime.Now;
        return Ok((await QueryBase().Where(e => e.NiveauId == niveauId).ToListAsync()).Select(e => Map(e, now)));
    }

    // GET api/emploidutemps/professeur/2
    [HttpGet("professeur/{profId:int}")]
    [Authorize(Roles = "Admin,Professeur")]
    public async Task<ActionResult<IEnumerable<EmploiDuTempsDto>>> GetByProfesseur(int profId)
    {
        var now = DateTime.Now;
        return Ok((await QueryBase().Where(e => e.ProfesseurId == profId).ToListAsync()).Select(e => Map(e, now)));
    }

    // GET api/emploidutemps/mention/1
    [HttpGet("mention/{mentionId:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<EmploiDuTempsDto>>> GetByMention(int mentionId)
    {
        var now = DateTime.Now;
        return Ok((await QueryBase()
            .Where(e => e.Niveau.MentionId == mentionId)
            .ToListAsync()).Select(e => Map(e, now)));
    }

    // GET api/emploidutemps/maintenant
    [HttpGet("maintenant")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<EmploiDuTempsDto>>> GetMaintenant()
    {
        var now = DateTime.Now;
        var heureNow = TimeOnly.FromDateTime(now);
        var jourNow = now.DayOfWeek;
        var creneaux = await QueryBase()
            .Where(e => e.Jour == jourNow && e.HeureDebut <= heureNow && e.HeureFin > heureNow)
            .ToListAsync();
        return Ok(creneaux.Select(e => Map(e, now)));
    }

    // GET api/emploidutemps/disponibilite
    [HttpGet("disponibilite")]
    [AllowAnonymous]
    public async Task<ActionResult<object>> GetDisponibilite()
    {
        var now = DateTime.Now;
        var heureNow = TimeOnly.FromDateTime(now);
        var jourNow = now.DayOfWeek;

        var creneauxNow = await QueryBase()
            .Where(e => e.Jour == jourNow && e.HeureDebut <= heureNow && e.HeureFin > heureNow)
            .ToListAsync();

        var profs = await _db.Professeurs.ToListAsync();
        var salles = await _db.Salles.Include(s => s.Niveau).ThenInclude(n => n.Mention).ToListAsync();
        var niveaux = await _db.Niveaux.Include(n => n.Mention).ToListAsync();

        return Ok(new
        {
            HeureActuelle = now.ToString("HH:mm"),
            Jour = now.DayOfWeek.ToString(),
            Professeurs = profs.Select(p =>
            {
                var c = creneauxNow.FirstOrDefault(e => e.ProfesseurId == p.Id);
                return new DisponibiliteDto("Professeur", $"{p.Prenom} {p.Nom}",
                    c is null ? "LIBRE" : "OCCUPE", c?.Cours?.Intitule,
                    c?.HeureDebut.ToString("HH:mm"), c?.HeureFin.ToString("HH:mm"));
            }),
            Salles = salles.Select(s =>
            {
                var c = creneauxNow.FirstOrDefault(e => e.SalleId == s.Id);
                return new DisponibiliteDto("Salle", s.Nom,
                    c is null ? "LIBRE" : "OCCUPE", c?.Cours?.Intitule,
                    c?.HeureDebut.ToString("HH:mm"), c?.HeureFin.ToString("HH:mm"));
            }),
            Niveaux = niveaux.Select(n =>
            {
                var c = creneauxNow.FirstOrDefault(e => e.NiveauId == n.Id);
                return new DisponibiliteDto("Niveau", $"{n.Mention.Code} {n.Label}",
                    c is null ? "LIBRE" : "OCCUPE", c?.Cours?.Intitule,
                    c?.HeureDebut.ToString("HH:mm"), c?.HeureFin.ToString("HH:mm"));
            })
        });
    }

    // POST api/emploidutemps
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<EmploiDuTempsDto>> Create(CreateEmploiDuTempsDto dto)
    {
        if (!TimeOnly.TryParse(dto.HeureDebut, out var heureDebut) ||
            !TimeOnly.TryParse(dto.HeureFin, out var heureFin))
            return BadRequest("Format d'heure invalide. Utilisez HH:mm (ex: 08:00).");

        if (heureFin <= heureDebut)
            return BadRequest("L'heure de fin doit être après l'heure de début.");

        var niveau = await _db.Niveaux.Include(n => n.Mention)
            .FirstOrDefaultAsync(n => n.Id == dto.NiveauId);
        if (niveau is null) return BadRequest($"Niveau {dto.NiveauId} introuvable.");

        var profAppartientMention = await _db.ProfesseurMentions
            .AnyAsync(pm => pm.ProfesseurId == dto.ProfesseurId && pm.MentionId == niveau.MentionId);
        if (!profAppartientMention)
            return BadRequest($"Ce professeur n'appartient pas à la mention '{niveau.Mention.Code}'.");

        var profEnseigneCours = await _db.ProfesseurCours
            .AnyAsync(pc => pc.ProfesseurId == dto.ProfesseurId && pc.CoursId == dto.CoursId);
        if (!profEnseigneCours)
            return BadRequest("Ce professeur n'est pas assigné à ce cours.");

        var salleValide = await _db.Salles
            .AnyAsync(s => s.Id == dto.SalleId && s.NiveauId == dto.NiveauId);
        if (!salleValide)
            return BadRequest("Cette salle n'appartient pas au niveau sélectionné.");

        var conflit = await _db.EmploisDuTemps.AnyAsync(e =>
            e.Jour == (DayOfWeek)dto.Jour &&
            e.HeureDebut < heureFin && e.HeureFin > heureDebut &&
            (e.ProfesseurId == dto.ProfesseurId || e.SalleId == dto.SalleId || e.NiveauId == dto.NiveauId));
        if (conflit)
            return Conflict("Conflit détecté : le professeur, la salle ou le niveau est déjà occupé sur ce créneau.");

        var emp = new EmploiDuTemps
        {
            NiveauId = dto.NiveauId, ProfesseurId = dto.ProfesseurId,
            CoursId = dto.CoursId, SalleId = dto.SalleId,
            Jour = (DayOfWeek)dto.Jour, HeureDebut = heureDebut, HeureFin = heureFin
        };
        _db.EmploisDuTemps.Add(emp);
        await _db.SaveChangesAsync();

        var created = await QueryBase().FirstAsync(e => e.Id == emp.Id);
        return CreatedAtAction(nameof(GetAll), Map(created, DateTime.Now));
    }

    // POST api/emploidutemps/groupe
    [HttpPost("groupe")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<EmploiDuTempsDto>>> CreateGroupe(CreateEmploiDuTempsGroupeDto dto)
    {
        if (!TimeOnly.TryParse(dto.HeureDebut, out var heureDebut) ||
            !TimeOnly.TryParse(dto.HeureFin, out var heureFin))
            return BadRequest("Format d'heure invalide.");

        if (heureFin <= heureDebut)
            return BadRequest("L'heure de fin doit être après l'heure de début.");

        var niveauA = await _db.Niveaux.Include(n => n.Mention)
            .FirstOrDefaultAsync(n => n.MentionId == dto.MentionId && n.Code == "L1" && n.Groupe == "A");
        var niveauB = await _db.Niveaux.Include(n => n.Mention)
            .FirstOrDefaultAsync(n => n.MentionId == dto.MentionId && n.Code == "L1" && n.Groupe == "B");

        if (niveauA is null || niveauB is null)
            return BadRequest("Les niveaux L1A et L1B de cette mention n'existent pas.");

        var profValide = await _db.ProfesseurMentions
            .AnyAsync(pm => pm.ProfesseurId == dto.ProfesseurId && pm.MentionId == dto.MentionId);
        if (!profValide)
            return BadRequest("Ce professeur n'appartient pas à cette mention.");

        var profEnseigneCours = await _db.ProfesseurCours
            .AnyAsync(pc => pc.ProfesseurId == dto.ProfesseurId && pc.CoursId == dto.CoursId);
        if (!profEnseigneCours)
            return BadRequest("Ce professeur n'est pas assigné à ce cours.");

        if (!await _db.Salles.AnyAsync(s => s.Id == dto.SalleIdA && s.NiveauId == niveauA.Id))
            return BadRequest("La salle A n'appartient pas au niveau L1A.");
        if (!await _db.Salles.AnyAsync(s => s.Id == dto.SalleIdB && s.NiveauId == niveauB.Id))
            return BadRequest("La salle B n'appartient pas au niveau L1B.");

        var conflit = await _db.EmploisDuTemps.AnyAsync(e =>
            e.Jour == (DayOfWeek)dto.Jour &&
            e.HeureDebut < heureFin && e.HeureFin > heureDebut &&
            (e.ProfesseurId == dto.ProfesseurId ||
             e.SalleId == dto.SalleIdA || e.SalleId == dto.SalleIdB ||
             e.NiveauId == niveauA.Id || e.NiveauId == niveauB.Id));
        if (conflit)
            return Conflict("Conflit détecté sur ce créneau.");

        var empA = new EmploiDuTemps
        {
            NiveauId = niveauA.Id, ProfesseurId = dto.ProfesseurId,
            CoursId = dto.CoursId, SalleId = dto.SalleIdA,
            Jour = (DayOfWeek)dto.Jour, HeureDebut = heureDebut, HeureFin = heureFin
        };
        var empB = new EmploiDuTemps
        {
            NiveauId = niveauB.Id, ProfesseurId = dto.ProfesseurId,
            CoursId = dto.CoursId, SalleId = dto.SalleIdB,
            Jour = (DayOfWeek)dto.Jour, HeureDebut = heureDebut, HeureFin = heureFin
        };

        _db.EmploisDuTemps.AddRange(empA, empB);
        await _db.SaveChangesAsync();

        var now = DateTime.Now;
        var ids = new[] { empA.Id, empB.Id };
        var created = await QueryBase().Where(e => ids.Contains(e.Id)).ToListAsync();
        return CreatedAtAction(nameof(GetAll), created.Select(e => Map(e, now)));
    }

    // DELETE api/emploidutemps/5
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var emp = await _db.EmploisDuTemps.FindAsync(id);
        if (emp is null) return NotFound();
        _db.EmploisDuTemps.Remove(emp);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ==================== NOUVEAUX ENDPOINTS POUR ÉTUDIANTS ====================

    // GET: api/emploidutemps/etudiant/mon-edt
    [HttpGet("etudiant/mon-edt")]
    [Authorize(Roles = "Etudiant")]
    public async Task<ActionResult<IEnumerable<EmploiDuTempsDto>>> GetMonEmploiDuTemps()
    {
        var etudiant = await GetCurrentEtudiant();
        if (etudiant == null)
            return NotFound("Étudiant non trouvé. Vérifiez votre email dans votre profil étudiant.");
        
        var now = DateTime.Now;
        var emplois = await QueryBase()
            .Where(e => e.NiveauId == etudiant.NiveauId)
            .OrderBy(e => e.Jour).ThenBy(e => e.HeureDebut)
            .ToListAsync();
        
        return Ok(emplois.Select(e => Map(e, now)));
    }

    // GET: api/emploidutemps/cours/{id}/details
    [HttpGet("cours/{id:int}/details")]
    [Authorize(Roles = "Etudiant,Professeur")]
    public async Task<ActionResult<CoursDetailsDto>> GetCoursDetails(int id)
    {
        var emploi = await QueryBase()
            .FirstOrDefaultAsync(e => e.Id == id);
        
        if (emploi == null)
            return NotFound("Cours non trouvé");
        
        return Ok(new CoursDetailsDto(
            Id: emploi.Id,
            Intitule: emploi.Cours.Intitule,
            Description: emploi.Cours.Description,
            Professeur: $"{emploi.Professeur.Prenom} {emploi.Professeur.Nom}",
            ProfesseurEmail: emploi.Professeur.Email,
            Salle: emploi.Salle.Nom,
            Horaire: $"{emploi.HeureDebut} - {emploi.HeureFin}",
            Jour: emploi.Jour.ToString(),
            Niveau: $"{emploi.Niveau.Mention.Code} {emploi.Niveau.Label}"
        ));
    }

    // ==================== NOUVEAUX ENDPOINTS POUR PROFESSEURS ====================

    // GET: api/emploidutemps/professeur/mon-edt
    [HttpGet("professeur/mon-edt")]
    [Authorize(Roles = "Professeur")]
    public async Task<ActionResult<IEnumerable<EmploiDuTempsDto>>> GetMonEmploiDuTempsProfesseur()
    {
        var professeur = await GetCurrentProfesseur();
        if (professeur == null)
            return NotFound("Professeur non trouvé. Vérifiez votre email dans votre profil professeur.");
        
        var now = DateTime.Now;
        var emplois = await QueryBase()
            .Where(e => e.ProfesseurId == professeur.Id)
            .OrderBy(e => e.Jour).ThenBy(e => e.HeureDebut)
            .ToListAsync();
        
        return Ok(emplois.Select(e => Map(e, now)));
    }

    // POST: api/emploidutemps/annuler/{id}
    [HttpPost("annuler/{id:int}")]
    [Authorize(Roles = "Professeur")]
    public async Task<IActionResult> AnnulerCours(int id, [FromBody] CreateAnnulationDto dto)
    {
        var emploi = await _db.EmploisDuTemps
            .Include(e => e.Cours)
            .Include(e => e.Professeur)
            .FirstOrDefaultAsync(e => e.Id == id);
        
        if (emploi == null)
            return NotFound("Cours non trouvé");
        
        var professeur = await GetCurrentProfesseur();
        if (emploi.ProfesseurId != professeur?.Id)
            return Forbid("Vous ne pouvez annuler que vos propres cours");
        
        // Vérifier si une demande existe déjà
        var existe = await _db.CoursAnnulations
            .AnyAsync(ca => ca.EmploiDuTempsId == id && ca.Statut == "En attente");
        if (existe)
            return Conflict("Une demande d'annulation est déjà en attente pour ce cours");
        
        var annulation = new CoursAnnulation
        {
            EmploiDuTempsId = id,
            ProfesseurId = professeur.Id,
            Motif = dto.Motif,
            DateDemande = DateTime.UtcNow,
            Statut = "En attente"
        };
        
        _db.CoursAnnulations.Add(annulation);
        await _db.SaveChangesAsync();
        
        return Ok(new { 
            message = "Demande d'annulation envoyée à l'admin",
            cours = emploi.Cours.Intitule,
            date = emploi.Jour.ToString(),
        });
    }

    // ==================== HELPERS ====================

    private IQueryable<EmploiDuTemps> QueryBase() => _db.EmploisDuTemps
        .Include(e => e.Niveau).ThenInclude(n => n.Mention)
        .Include(e => e.Professeur).Include(e => e.Cours).Include(e => e.Salle)
        .OrderBy(e => e.Jour).ThenBy(e => e.HeureDebut);

    private static EmploiDuTempsDto Map(EmploiDuTemps e, DateTime now)
    {
        var heureNow = TimeOnly.FromDateTime(now);
        var occupe = e.Jour == now.DayOfWeek && e.HeureDebut <= heureNow && e.HeureFin > heureNow;
        return new EmploiDuTempsDto(e.Id, e.Niveau.Mention.Code, e.Niveau.Label,
            e.Cours.Intitule, $"{e.Professeur.Prenom} {e.Professeur.Nom}",
            e.Salle.Nom, e.Jour.ToString(),
            e.HeureDebut.ToString("HH:mm"), e.HeureFin.ToString("HH:mm"),
            occupe ? "OCCUPE" : "LIBRE");
    }

    private async Task<Etudiant?> GetCurrentEtudiant()
    {
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(email)) return null;
        return await _db.Etudiants.FirstOrDefaultAsync(e => e.Email == email);
    }

    private async Task<Professeur?> GetCurrentProfesseur()
    {
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(email)) return null;
        return await _db.Professeurs.FirstOrDefaultAsync(p => p.Email == email);
    }
}