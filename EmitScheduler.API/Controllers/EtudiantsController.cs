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
public class EtudiantsController : ControllerBase
{
    private readonly AppDbContext _db;
    public EtudiantsController(AppDbContext db) => _db = db;

    [HttpGet]
    [Authorize(Roles = "Admin,Professeur")]
    public async Task<ActionResult<IEnumerable<EtudiantDto>>> GetAll()
    {
        var etudiants = await _db.Etudiants
            .Include(e => e.Niveau).ThenInclude(n => n.Mention)
            .OrderBy(e => e.Nom).ThenBy(e => e.Prenom)
            .ToListAsync();
        return Ok(etudiants.Select(Map));
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Professeur,Etudiant")]
    public async Task<ActionResult<EtudiantDto>> GetById(int id)
    {
        var e = await _db.Etudiants.Include(x => x.Niveau).ThenInclude(n => n.Mention)
            .FirstOrDefaultAsync(x => x.Id == id);
        if (e is null) return NotFound($"Étudiant {id} introuvable.");
        return Ok(Map(e));
    }

    // GET api/etudiants/niveau/3  → tous les étudiants d'un niveau (ex: DA2I L1A)
    [HttpGet("niveau/{niveauId:int}")]
    [Authorize(Roles = "Admin,Professeur")]
    public async Task<ActionResult<IEnumerable<EtudiantDto>>> GetByNiveau(int niveauId)
    {
        var etudiants = await _db.Etudiants
            .Include(e => e.Niveau).ThenInclude(n => n.Mention)
            .Where(e => e.NiveauId == niveauId)
            .OrderBy(e => e.Nom).ToListAsync();
        return Ok(etudiants.Select(Map));
    }

    // GET api/etudiants/mention/1  → tous les étudiants d'une mention (tous niveaux)
    [HttpGet("mention/{mentionId:int}")]
    [Authorize(Roles = "Admin,Professeur")]
    public async Task<ActionResult<IEnumerable<EtudiantDto>>> GetByMention(int mentionId)
    {
        var etudiants = await _db.Etudiants
            .Include(e => e.Niveau).ThenInclude(n => n.Mention)
            .Where(e => e.Niveau.MentionId == mentionId)
            .OrderBy(e => e.Niveau.Code).ThenBy(e => e.Niveau.Groupe).ThenBy(e => e.Nom)
            .ToListAsync();
        return Ok(etudiants.Select(Map));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<EtudiantDto>> Create(CreateEtudiantDto dto)
    {
        var niveau = await _db.Niveaux.Include(n => n.Mention)
            .FirstOrDefaultAsync(n => n.Id == dto.NiveauId);
        if (niveau is null) return BadRequest($"Niveau {dto.NiveauId} introuvable.");

        // Pour L1 : l'étudiant doit être dans L1A ou L1B (pas dans un L1 sans groupe)
        if (niveau.Code == "L1" && niveau.Groupe is null)
            return BadRequest("Pour L1, assignez l'étudiant à L1A ou L1B, pas à L1 directement.");

        if (await _db.Etudiants.AnyAsync(e => e.NumeroEtudiant == dto.NumeroEtudiant))
            return Conflict($"Le numéro étudiant '{dto.NumeroEtudiant}' est déjà utilisé.");

        var etudiant = new Etudiant
        {
            Nom = dto.Nom, Prenom = dto.Prenom,
            NumeroEtudiant = dto.NumeroEtudiant, NiveauId = dto.NiveauId
        };
        _db.Etudiants.Add(etudiant);
        await _db.SaveChangesAsync();
        etudiant.Niveau = niveau;
        return CreatedAtAction(nameof(GetById), new { id = etudiant.Id }, Map(etudiant));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, CreateEtudiantDto dto)
    {
        var etudiant = await _db.Etudiants.FindAsync(id);
        if (etudiant is null) return NotFound($"Étudiant {id} introuvable.");

        var niveau = await _db.Niveaux.FindAsync(dto.NiveauId);
        if (niveau is null) return BadRequest($"Niveau {dto.NiveauId} introuvable.");
        if (niveau.Code == "L1" && niveau.Groupe is null)
            return BadRequest("Pour L1, assignez l'étudiant à L1A ou L1B.");

        if (await _db.Etudiants.AnyAsync(e => e.NumeroEtudiant == dto.NumeroEtudiant && e.Id != id))
            return Conflict($"Le numéro étudiant '{dto.NumeroEtudiant}' est déjà utilisé.");

        etudiant.Nom = dto.Nom;
        etudiant.Prenom = dto.Prenom;
        etudiant.NumeroEtudiant = dto.NumeroEtudiant;
        etudiant.NiveauId = dto.NiveauId;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var etudiant = await _db.Etudiants.FindAsync(id);
        if (etudiant is null) return NotFound($"Étudiant {id} introuvable.");
        _db.Etudiants.Remove(etudiant);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static EtudiantDto Map(Etudiant e) => new(
        e.Id, e.Nom, e.Prenom, e.NumeroEtudiant, e.NiveauId,
        $"{e.Niveau.Mention.Code} {e.Niveau.Label}"
    );
}