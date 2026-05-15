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
public class MentionsController : ControllerBase
{
    private readonly AppDbContext _db;
    public MentionsController(AppDbContext db) => _db = db;

    [HttpGet]
    [Authorize(Roles = "Admin,Professeur,Etudiant")]
    public async Task<ActionResult<IEnumerable<MentionDto>>> GetAll() =>
        Ok(await _db.Mentions.OrderBy(m => m.Code)
            .Select(m => new MentionDto(m.Id, m.Code, m.Nom)).ToListAsync());

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Professeur,Etudiant")]
    public async Task<ActionResult<MentionDto>> GetById(int id)
    {
        var m = await _db.Mentions.FindAsync(id);
        if (m is null) return NotFound($"Mention {id} introuvable.");
        return Ok(new MentionDto(m.Id, m.Code, m.Nom));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<MentionDto>> Create(CreateMentionDto dto)
    {
        if (await _db.Mentions.AnyAsync(m => m.Code == dto.Code.ToUpper()))
            return Conflict($"La mention '{dto.Code}' existe déjà.");
        var mention = new Mention { Code = dto.Code.ToUpper(), Nom = dto.Nom };
        _db.Mentions.Add(mention);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = mention.Id },
            new MentionDto(mention.Id, mention.Code, mention.Nom));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, CreateMentionDto dto)
    {
        var mention = await _db.Mentions.FindAsync(id);
        if (mention is null) return NotFound();
        mention.Code = dto.Code.ToUpper();
        mention.Nom = dto.Nom;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var mention = await _db.Mentions.FindAsync(id);
        if (mention is null) return NotFound();
        _db.Mentions.Remove(mention);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}