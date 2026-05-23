using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EmitScheduler.API.Migrations
{
    /// <inheritdoc />
    public partial class AddExtraFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NumeroEtudiant",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Specialite",
                table: "Users",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NumeroEtudiant",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Specialite",
                table: "Users");
        }
    }
}
