using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EmitScheduler.API.Migrations
{
    /// <inheritdoc />
    public partial class AddGroupeToNiveau : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Niveaux_MentionId_Code",
                table: "Niveaux");

            migrationBuilder.AddColumn<string>(
                name: "Groupe",
                table: "Niveaux",
                type: "character varying(2)",
                maxLength: 2,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Niveaux_MentionId_Code_Groupe",
                table: "Niveaux",
                columns: new[] { "MentionId", "Code", "Groupe" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Niveaux_MentionId_Code_Groupe",
                table: "Niveaux");

            migrationBuilder.DropColumn(
                name: "Groupe",
                table: "Niveaux");

            migrationBuilder.CreateIndex(
                name: "IX_Niveaux_MentionId_Code",
                table: "Niveaux",
                columns: new[] { "MentionId", "Code" },
                unique: true);
        }
    }
}
