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

    // --- PARTIE EMPLOI DU TEMPS (Utilise l'ancien format) ---
    [HttpGet]
    [Authorize(Roles = "Admin,Professeur,Etudiant")]
    public async Task<ActionResult<IEnumerable<EmploiDuTempsDto>>> GetAll() =>
        Ok(await _db.EmploisDuTemps
            .Include(e => e.Cours)
            .Include(e => e.Professeur)
            .Include(e => e.Salle)
            // Exemple à adapter dans votre méthode GetAll()
            .Select(e => new EmploiDuTempsDto(
                e.Id,
                e.Niveau.Mention.Nom, // ou e.Cours.Niveau.Mention.Code
                e.Niveau.Label,
                e.Cours.Intitule,
                e.Professeur.Nom + " " + e.Professeur.Prenom,
                e.Salle.Nom,
                e.Jour.ToString(),
                e.HeureDebut.ToString(),
                e.HeureFin.ToString(),
                e.Statut.ToString()
            ))
            .ToListAsync());

    // --- PARTIE GESTION DES COURS (Utilise le nouveau DTO) ---
    [HttpGet("definitions")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> GetAllDefinitions()
    {
        var cours = await _db.Cours
            .Include(c => c.ProfesseurCours).ThenInclude(pc => pc.Professeur)
            .Include(c => c.Niveau)
            .Select(c => new {
                c.Id,
                c.Intitule,
                // S'assurer que ces propriétés existent
                NiveauLabel = c.Niveau.Label, 
                ProfesseursNoms = c.ProfesseurCours.Select(pc => pc.Professeur.Nom).ToList()
            })
            .ToListAsync();

        return Ok(cours);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CoursDto dto)
    {
        var cours = new Cours { 
            Intitule = dto.Intitule, 
            Description = dto.Description,
            NiveauId = dto.NiveauId 
        };
        
        _db.Cours.Add(cours);
        await _db.SaveChangesAsync();

        foreach(var pId in dto.ProfesseurIds) {
            _db.ProfesseurCours.Add(new ProfesseurCours { CoursId = cours.Id, ProfesseurId = pId });
        }

        await _db.SaveChangesAsync();
        return Ok(new { id = cours.Id });
    }
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id) {
        var cours = await _db.Cours.FindAsync(id);
        if (cours == null) return NotFound();
        _db.Cours.Remove(cours);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] CoursDto dto) {
        var cours = await _db.Cours.Include(c => c.ProfesseurCours).FirstOrDefaultAsync(c => c.Id == id);
        if (cours == null) return NotFound();

        cours.Intitule = dto.Intitule;
        cours.Description = dto.Description;
        cours.NiveauId = dto.NiveauId;
        
        // Mise à jour des profs
        _db.ProfesseurCours.RemoveRange(cours.ProfesseurCours);
        foreach(var pId in dto.ProfesseurIds) {
            _db.ProfesseurCours.Add(new ProfesseurCours { CoursId = id, ProfesseurId = pId });
        }
        
        await _db.SaveChangesAsync();
        return Ok();
    }
}