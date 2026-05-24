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
public class CoursController : ControllerBase
{
    private readonly AppDbContext _db;
    public CoursController(AppDbContext db) => _db = db;

    [HttpGet]
    [Authorize(Roles = "Admin,Professeur,Etudiant")]
    public async Task<ActionResult<IEnumerable<CoursDto>>> GetAll() =>
        Ok(await _db.EmploisDuTemps
            .Include(e => e.Cours)
            .Include(e => e.Professeur)
            .Include(e => e.Salle)
            .Select(e => new CoursDto(e.Cours.Id, e.Cours.Intitule, e.Cours.Description, e.Professeur.Nom, e.Salle.Nom, e.Statut.ToString()))
            .ToListAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CoursDto>> GetById(int id)
    {
        var e = await _db.EmploisDuTemps
            .Include(x => x.Cours)
            .Include(x => x.Professeur)
            .Include(x => x.Salle)
            .FirstOrDefaultAsync(x => x.CoursId == id);
            
        return e is null ? NotFound() : Ok(new CoursDto(e.Cours.Id, e.Cours.Intitule, e.Cours.Description, e.Professeur.Nom, e.Salle.Nom, e.Statut.ToString()));
    }

    [HttpPost("complet")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateComplet([FromBody] CreateCoursDto dto) // Utilisez le DTO complet ici
    {
        using var transaction = await _db.Database.BeginTransactionAsync();
        try {
            var cours = new Cours { Intitule = dto.Intitule, Description = dto.Description };
            _db.Cours.Add(cours);
            await _db.SaveChangesAsync();

            var profCours = new ProfesseurCours { ProfesseurId = dto.ProfesseurId, CoursId = cours.Id };
            _db.ProfesseurCours.Add(profCours);

            var edt = new EmploiDuTemps {
                CoursId = cours.Id,
                ProfesseurId = dto.ProfesseurId,
                SalleId = dto.SalleId,
                NiveauId = dto.NiveauId,
                Jour = (DayOfWeek)dto.Jour,
                HeureDebut = TimeOnly.FromTimeSpan(dto.HeureDebut),
                HeureFin = TimeOnly.FromTimeSpan(dto.HeureFin),
                Statut = StatutCreneau.OCCUPE
            };
            _db.EmploisDuTemps.Add(edt);
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();
            return Ok(new { message = "Succès" });
        }
        catch { await transaction.RollbackAsync(); return StatusCode(500); }
    }

    [HttpGet("dashboard")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<CoursDto>>> GetDashboardData()
    {
        var data = await _db.EmploisDuTemps
            .Include(e => e.Cours)
            .Include(e => e.Salle)
            .Include(e => e.Professeur)
            .Select(e => new CoursDto(
                e.Cours.Id,
                e.Cours.Intitule,
                "Description", // Ajoutez une valeur par défaut ici
                e.Professeur.Nom + " " + e.Professeur.Prenom,
                e.Salle.Nom,
                _db.CoursAnnulations.Any(a => a.EmploiDuTempsId == e.Id) ? "Annulé" : "Actif"
            ))
            .ToListAsync();
        return Ok(data);
    }
}