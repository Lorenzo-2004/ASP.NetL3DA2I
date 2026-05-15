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
public class ProfesseursController : ControllerBase
{
    private readonly AppDbContext _db;
    public ProfesseursController(AppDbContext db) => _db = db;

    [HttpGet]
    [Authorize(Roles = "Admin,Professeur,Etudiant")]
    public async Task<ActionResult<IEnumerable<ProfesseurDto>>> GetAll()
    {
        var profs = await _db.Professeurs
            .Include(p => p.ProfesseurMentions).ThenInclude(pm => pm.Mention)
            .Include(p => p.ProfesseurCours).ThenInclude(pc => pc.Cours)
            .OrderBy(p => p.Nom).ToListAsync();
        return Ok(profs.Select(Map));
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Professeur,Etudiant")]
    public async Task<ActionResult<ProfesseurDto>> GetById(int id)
    {
        var p = await _db.Professeurs
            .Include(p => p.ProfesseurMentions).ThenInclude(pm => pm.Mention)
            .Include(p => p.ProfesseurCours).ThenInclude(pc => pc.Cours)
            .FirstOrDefaultAsync(p => p.Id == id);
        if (p is null) return NotFound($"Professeur {id} introuvable.");
        return Ok(Map(p));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProfesseurDto>> Create(CreateProfesseurDto dto)
    {
        var prof = new Professeur { Nom = dto.Nom, Prenom = dto.Prenom, Email = dto.Email };

        foreach (var mId in dto.MentionIds.Distinct())
        {
            if (!await _db.Mentions.AnyAsync(m => m.Id == mId))
                return BadRequest($"Mention {mId} introuvable.");
            prof.ProfesseurMentions.Add(new ProfesseurMention { MentionId = mId, Professeur = prof });
        }

        foreach (var cId in dto.CoursIds.Distinct())
        {
            if (!await _db.Cours.AnyAsync(c => c.Id == cId))
                return BadRequest($"Cours {cId} introuvable.");
            prof.ProfesseurCours.Add(new ProfesseurCours { CoursId = cId, Professeur = prof });
        }

        _db.Professeurs.Add(prof);
        await _db.SaveChangesAsync();
        return await GetById(prof.Id);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, CreateProfesseurDto dto)
    {
        var prof = await _db.Professeurs
            .Include(p => p.ProfesseurMentions)
            .Include(p => p.ProfesseurCours)
            .FirstOrDefaultAsync(p => p.Id == id);
        if (prof is null) return NotFound();

        prof.Nom = dto.Nom;
        prof.Prenom = dto.Prenom;
        prof.Email = dto.Email;

        _db.ProfesseurMentions.RemoveRange(prof.ProfesseurMentions);
        foreach (var mId in dto.MentionIds.Distinct())
            prof.ProfesseurMentions.Add(new ProfesseurMention { ProfesseurId = id, MentionId = mId });

        _db.ProfesseurCours.RemoveRange(prof.ProfesseurCours);
        foreach (var cId in dto.CoursIds.Distinct())
            prof.ProfesseurCours.Add(new ProfesseurCours { ProfesseurId = id, CoursId = cId });

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var p = await _db.Professeurs.FindAsync(id);
        if (p is null) return NotFound();
        _db.Professeurs.Remove(p);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static ProfesseurDto Map(Professeur p) => new(
        p.Id, p.Nom, p.Prenom, p.Email,
        p.ProfesseurMentions.Select(pm => pm.Mention.Code).ToList(),
        p.ProfesseurCours.Select(pc => pc.Cours.Intitule).ToList()
    );
}