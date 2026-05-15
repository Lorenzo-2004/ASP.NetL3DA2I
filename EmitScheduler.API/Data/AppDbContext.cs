using EmitScheduler.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EmitScheduler.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Mention> Mentions => Set<Mention>();
    public DbSet<Niveau> Niveaux => Set<Niveau>();
    public DbSet<Salle> Salles => Set<Salle>();
    public DbSet<Professeur> Professeurs => Set<Professeur>();
    public DbSet<Cours> Cours => Set<Cours>();
    public DbSet<Etudiant> Etudiants => Set<Etudiant>();
    public DbSet<EmploiDuTemps> EmploisDuTemps => Set<EmploiDuTemps>();
    public DbSet<ProfesseurMention> ProfesseurMentions => Set<ProfesseurMention>();
    public DbSet<ProfesseurCours> ProfesseurCours => Set<ProfesseurCours>();
    public DbSet<User> Users => Set<User>();
    public DbSet<CoursAnnulation> CoursAnnulations => Set<CoursAnnulation>();  // ← AJOUTER CETTE LIGNE

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuration de User (AUTHENTIFICATION)
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.Property(u => u.Email).HasMaxLength(150).IsRequired();
            e.Property(u => u.PasswordHash).IsRequired();
            e.Property(u => u.Role).HasMaxLength(20).IsRequired().HasDefaultValue("Etudiant");
            e.Property(u => u.FirstName).HasMaxLength(100);
            e.Property(u => u.LastName).HasMaxLength(100);
            e.HasIndex(u => u.Email).IsUnique();
            
            // Relations avec les tables existantes
            e.HasOne(u => u.Professeur)
                .WithOne(p => p.User)
                .HasForeignKey<User>(u => u.ProfesseurId)
                .OnDelete(DeleteBehavior.SetNull);
            
            e.HasOne(u => u.Etudiant)
                .WithOne(et => et.User)
                .HasForeignKey<User>(u => u.EtudiantId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Configuration de Mention
        modelBuilder.Entity<Mention>(e =>
        {
            e.HasKey(m => m.Id);
            e.Property(m => m.Code).HasMaxLength(10).IsRequired();
            e.Property(m => m.Nom).HasMaxLength(100).IsRequired();
            e.HasIndex(m => m.Code).IsUnique();
        });

        // Configuration de Niveau
        modelBuilder.Entity<Niveau>(e =>
        {
            e.HasKey(n => n.Id);
            e.Property(n => n.Code).HasMaxLength(5).IsRequired();
            e.Property(n => n.Groupe).HasMaxLength(2);
            e.Ignore(n => n.Label);
            e.HasOne(n => n.Mention)
             .WithMany(m => m.Niveaux)
             .HasForeignKey(n => n.MentionId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(n => new { n.MentionId, n.Code, n.Groupe }).IsUnique();
        });

        // Configuration de Salle
        modelBuilder.Entity<Salle>(e =>
        {
            e.HasKey(s => s.Id);
            e.Property(s => s.Nom).HasMaxLength(100).IsRequired();
            e.HasOne(s => s.Niveau)
             .WithOne(n => n.Salle)
             .HasForeignKey<Salle>(s => s.NiveauId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Configuration de Professeur
        modelBuilder.Entity<Professeur>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.Nom).HasMaxLength(100).IsRequired();
            e.Property(p => p.Prenom).HasMaxLength(100).IsRequired();
            e.Property(p => p.Email).HasMaxLength(150);
        });

        // Configuration de Cours
        modelBuilder.Entity<Cours>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.Intitule).HasMaxLength(150).IsRequired();
        });

        // Configuration de ProfesseurMention
        modelBuilder.Entity<ProfesseurMention>(e =>
        {
            e.HasKey(pm => new { pm.ProfesseurId, pm.MentionId });
            e.HasOne(pm => pm.Professeur)
                .WithMany(p => p.ProfesseurMentions)
                .HasForeignKey(pm => pm.ProfesseurId);
            e.HasOne(pm => pm.Mention)
                .WithMany(m => m.ProfesseurMentions)
                .HasForeignKey(pm => pm.MentionId);
        });

        // Configuration de ProfesseurCours
        modelBuilder.Entity<ProfesseurCours>(e =>
        {
            e.HasKey(pc => new { pc.ProfesseurId, pc.CoursId });
            e.HasOne(pc => pc.Professeur)
                .WithMany(p => p.ProfesseurCours)
                .HasForeignKey(pc => pc.ProfesseurId);
            e.HasOne(pc => pc.Cours)
                .WithMany(c => c.ProfesseurCours)
                .HasForeignKey(pc => pc.CoursId);
        });

        // Configuration de Etudiant
        modelBuilder.Entity<Etudiant>(e =>
        {
            e.HasKey(et => et.Id);
            e.Property(et => et.Nom).HasMaxLength(100).IsRequired();
            e.Property(et => et.Prenom).HasMaxLength(100).IsRequired();
            e.Property(et => et.NumeroEtudiant).HasMaxLength(20).IsRequired();
            e.Property(et => et.Email).HasMaxLength(150);  // ← AJOUTER CETTE LIGNE
            e.HasIndex(et => et.NumeroEtudiant).IsUnique();
            e.HasOne(et => et.Niveau)
             .WithMany(n => n.Etudiants)
             .HasForeignKey(et => et.NiveauId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Configuration de EmploiDuTemps
        modelBuilder.Entity<EmploiDuTemps>(e =>
        {
            e.HasKey(emp => emp.Id);
            e.HasOne(emp => emp.Niveau)
                .WithMany(n => n.EmploisDuTemps)
                .HasForeignKey(emp => emp.NiveauId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(emp => emp.Professeur)
                .WithMany(p => p.EmploisDuTemps)
                .HasForeignKey(emp => emp.ProfesseurId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(emp => emp.Cours)
                .WithMany(c => c.EmploisDuTemps)
                .HasForeignKey(emp => emp.CoursId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(emp => emp.Salle)
                .WithMany(s => s.EmploisDuTemps)
                .HasForeignKey(emp => emp.SalleId)
                .OnDelete(DeleteBehavior.Restrict);
            e.Property(emp => emp.Statut).HasConversion<string>();
            e.Property(emp => emp.HeureDebut).HasColumnType("time");
            e.Property(emp => emp.HeureFin).HasColumnType("time");
        });

        // ==================== CONFIGURATION DE COURS ANNULATION ====================
        modelBuilder.Entity<CoursAnnulation>(e =>
        {
            e.HasKey(ca => ca.Id);
            e.HasOne(ca => ca.EmploiDuTemps)
                .WithMany()
                .HasForeignKey(ca => ca.EmploiDuTempsId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(ca => ca.Professeur)
                .WithMany()
                .HasForeignKey(ca => ca.ProfesseurId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(ca => ca.TraiteParAdmin)
                .WithMany()
                .HasForeignKey(ca => ca.TraiteParAdminId)
                .OnDelete(DeleteBehavior.SetNull);
            e.Property(ca => ca.Statut).HasMaxLength(20).HasDefaultValue("En attente");
            e.HasIndex(ca => ca.Statut);
        });
    }
}