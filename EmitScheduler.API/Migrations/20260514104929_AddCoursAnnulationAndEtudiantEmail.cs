using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EmitScheduler.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCoursAnnulationAndEtudiantEmail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Etudiants",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CoursAnnulations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EmploiDuTempsId = table.Column<int>(type: "integer", nullable: false),
                    ProfesseurId = table.Column<int>(type: "integer", nullable: false),
                    Motif = table.Column<string>(type: "text", nullable: false),
                    DateDemande = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Statut = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "En attente"),
                    DateTraitement = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TraiteParAdminId = table.Column<int>(type: "integer", nullable: true),
                    CommentaireAdmin = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CoursAnnulations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CoursAnnulations_EmploisDuTemps_EmploiDuTempsId",
                        column: x => x.EmploiDuTempsId,
                        principalTable: "EmploisDuTemps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CoursAnnulations_Professeurs_ProfesseurId",
                        column: x => x.ProfesseurId,
                        principalTable: "Professeurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CoursAnnulations_Users_TraiteParAdminId",
                        column: x => x.TraiteParAdminId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CoursAnnulations_EmploiDuTempsId",
                table: "CoursAnnulations",
                column: "EmploiDuTempsId");

            migrationBuilder.CreateIndex(
                name: "IX_CoursAnnulations_ProfesseurId",
                table: "CoursAnnulations",
                column: "ProfesseurId");

            migrationBuilder.CreateIndex(
                name: "IX_CoursAnnulations_Statut",
                table: "CoursAnnulations",
                column: "Statut");

            migrationBuilder.CreateIndex(
                name: "IX_CoursAnnulations_TraiteParAdminId",
                table: "CoursAnnulations",
                column: "TraiteParAdminId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CoursAnnulations");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "Etudiants");
        }
    }
}
