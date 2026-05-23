using EmitScheduler.API.Data;
using EmitScheduler.API.Models;
using EmitScheduler.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace EmitScheduler.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IJwtService _jwtService;

    public AuthController(AppDbContext context, IJwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
        
        // 💡 Crée l'administrateur au premier appel de l'API s'il n'existe pas
        SeedAdminUser();
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            return BadRequest(new { message = "Cet email est déjà utilisé" });

        var user = new User
        {
            Email = request.Email,
            PasswordHash = HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Role = request.Role ?? "Etudiant",
            CreatedAt = DateTime.UtcNow,
            NumeroEtudiant = request.NumeroEtudiant,
            Specialite = request.Specialite,
            IsActive = true
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var roles = new List<string> { user.Role };
        var token = _jwtService.GenerateToken(user.Id.ToString(), user.Email, roles);

        return Ok(new 
        { 
            token, 
            user.Email, 
            user.FirstName, 
            user.LastName,
            user.Role,
            userId = user.Id 
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Email ou mot de passe incorrect" });

        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var roles = new List<string> { user.Role };
        var token = _jwtService.GenerateToken(user.Id.ToString(), user.Email, roles);

        return Ok(new 
        { 
            token, 
            user.Email, 
            user.FirstName, 
            user.LastName,
            user.Role,
            userId = user.Id 
        });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
            return Unauthorized();

        var user = await _context.Users.FindAsync(int.Parse(userId));
        if (user == null)
            return NotFound();

        return Ok(new
        {
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Role,
            user.CreatedAt,
            user.LastLoginAt
        });
    }

    private void SeedAdminUser()
    {
        try
        {
            // Vérifie si un administrateur existe déjà dans la base PostgreSQL
            var adminExists = _context.Users.Any(u => u.Role == "Admin");
            if (!adminExists)
            {
                var admin = new User
                {
                    Email = "admin@emit-university.fr",
                    PasswordHash = HashPassword("AdminEMIT2026!"),
                    FirstName = "EMIT",
                    LastName = "Admin",
                    Role = "Admin",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                _context.Users.Add(admin);
                _context.SaveChanges();
            }
        }
        catch (Exception ex)
        {
            // Évite de bloquer l'application en cas d'erreur de migration initiale
            Console.WriteLine($"Erreur d'initialisation Admin : {ex.Message}");
        }
    }

    private string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hashedBytes);
    }

    private bool VerifyPassword(string password, string hash)
    {
        var hashOfInput = HashPassword(password);
        return hashOfInput == hash;
    }
}

public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Role { get; set; }
    public string? NumeroEtudiant { get; set; }
    public string? Specialite { get; set; }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}