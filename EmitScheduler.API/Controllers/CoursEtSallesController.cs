using EmitScheduler.API.Data;
using EmitScheduler.API.DTOs;
using EmitScheduler.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmitScheduler.API.Controllers;

// ── COURS ─────────────────────────────────────────────────────────────────────

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
        Ok(await _db.Cours.OrderBy(c => c.Intitule)
            .Select(c => new CoursDto(c.Id, c.Intitule, c.Description)).ToListAsync());

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Professeur,Etudiant")]
    public async Task<ActionResult<CoursDto>> GetById(int id)
    {
        var c = await _db.Cours.FindAsync(id);
        return c is null ? NotFound() : Ok(new CoursDto(c.Id, c.Intitule, c.Description));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CoursDto>> Create(CreateCoursDto dto)
    {
        var cours = new Cours { Intitule = dto.Intitule, Description = dto.Description };
        _db.Cours.Add(cours);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = cours.Id },
            new CoursDto(cours.Id, cours.Intitule, cours.Description));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, CreateCoursDto dto)
    {
        var cours = await _db.Cours.FindAsync(id);
        if (cours is null) return NotFound();
        cours.Intitule = dto.Intitule;
        cours.Description = dto.Description;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var cours = await _db.Cours.FindAsync(id);
        if (cours is null) return NotFound();
        _db.Cours.Remove(cours);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

// ── SALLES ────────────────────────────────────────────────────────────────────

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SallesController : ControllerBase
{
    private readonly AppDbContext _db;
    public SallesController(AppDbContext db) => _db = db;

    [HttpGet]
    [Authorize(Roles = "Admin,Professeur,Etudiant")]
    public async Task<ActionResult<IEnumerable<SalleDto>>> GetAll() =>
        Ok(await _db.Salles.Include(s => s.Niveau).ThenInclude(n => n.Mention)
            .OrderBy(s => s.Nom)
            .Select(s => new SalleDto(s.Id, s.Nom, s.Capacite, s.NiveauId,
                $"{s.Niveau.Mention.Code} {s.Niveau.Label}"))
            .ToListAsync());

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Professeur,Etudiant")]
    public async Task<ActionResult<SalleDto>> GetById(int id)
    {
        var s = await _db.Salles.Include(x => x.Niveau).ThenInclude(n => n.Mention)
            .FirstOrDefaultAsync(x => x.Id == id);
        if (s is null) return NotFound();
        return Ok(new SalleDto(s.Id, s.Nom, s.Capacite, s.NiveauId,
            $"{s.Niveau.Mention.Code} {s.Niveau.Label}"));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SalleDto>> Create(CreateSalleDto dto)
    {
        if (await _db.Salles.AnyAsync(s => s.NiveauId == dto.NiveauId))
            return Conflict("Ce niveau a déjà une salle assignée.");
        var salle = new Salle { Nom = dto.Nom, Capacite = dto.Capacite, NiveauId = dto.NiveauId };
        _db.Salles.Add(salle);
        await _db.SaveChangesAsync();
        return await GetById(salle.Id);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, CreateSalleDto dto)
    {
        var salle = await _db.Salles.FindAsync(id);
        if (salle is null) return NotFound();
        salle.Nom = dto.Nom;
        salle.Capacite = dto.Capacite;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var s = await _db.Salles.FindAsync(id);
        if (s is null) return NotFound();
        _db.Salles.Remove(s);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}