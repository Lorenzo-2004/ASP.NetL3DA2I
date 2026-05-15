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
public class NiveauxController : ControllerBase
{
    private readonly AppDbContext _db;
    public NiveauxController(AppDbContext db) => _db = db;

    [HttpGet]
    [Authorize(Roles = "Admin,Professeur,Etudiant")]
    public async Task<ActionResult<IEnumerable<NiveauDto>>> GetAll()
    {
        var niveaux = await _db.Niveaux.Include(n => n.Mention)
            .OrderBy(n => n.Mention.Code).ThenBy(n => n.Code).ThenBy(n => n.Groupe)
            .ToListAsync();
        return Ok(niveaux.Select(Map));
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Professeur,Etudiant")]
    public async Task<ActionResult<NiveauDto>> GetById(int id)
    {
        var n = await _db.Niveaux.Include(x => x.Mention).FirstOrDefaultAsync(x => x.Id == id);
        if (n is null) return NotFound($"Niveau {id} introuvable.");
        return Ok(Map(n));
    }

    [HttpGet("byMention/{mentionId:int}")]
    [Authorize(Roles = "Admin,Professeur,Etudiant")]
    public async Task<ActionResult<IEnumerable<NiveauDto>>> GetByMention(int mentionId)
    {
        var niveaux = await _db.Niveaux.Include(n => n.Mention)
            .Where(n => n.MentionId == mentionId)
            .OrderBy(n => n.Code).ThenBy(n => n.Groupe)
            .ToListAsync();
        return Ok(niveaux.Select(Map));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<NiveauDto>> Create(CreateNiveauDto dto)
    {
        if (!await _db.Mentions.AnyAsync(m => m.Id == dto.MentionId))
            return BadRequest("Mention introuvable.");

        var code = dto.Code.ToUpper();

        // Règle métier : Groupe uniquement pour L1
        if (code == "L1")
        {
            if (dto.Groupe is null || (dto.Groupe.ToUpper() != "A" && dto.Groupe.ToUpper() != "B"))
                return BadRequest("Pour L1, le groupe doit être 'A' ou 'B'.");
        }
        else
        {
            if (dto.Groupe is not null)
                return BadRequest("Le groupe (A/B) est réservé aux niveaux L1.");
        }

        var niveau = new Niveau { Code = code, Groupe = dto.Groupe?.ToUpper(), MentionId = dto.MentionId };
        _db.Niveaux.Add(niveau);
        await _db.SaveChangesAsync();
        await _db.Entry(niveau).Reference(n => n.Mention).LoadAsync();
        return CreatedAtAction(nameof(GetById), new { id = niveau.Id }, Map(niveau));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var n = await _db.Niveaux.FindAsync(id);
        if (n is null) return NotFound();
        _db.Niveaux.Remove(n);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static NiveauDto Map(Niveau n) =>
        new(n.Id, n.Code, n.Groupe, n.Label, n.MentionId, n.Mention.Code);
}