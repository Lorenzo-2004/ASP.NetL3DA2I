using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EmitScheduler.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCoursModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Cours",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NiveauId",
                table: "Cours",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Cours_NiveauId",
                table: "Cours",
                column: "NiveauId");

            migrationBuilder.AddForeignKey(
                name: "FK_Cours_Niveaux_NiveauId",
                table: "Cours",
                column: "NiveauId",
                principalTable: "Niveaux",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cours_Niveaux_NiveauId",
                table: "Cours");

            migrationBuilder.DropIndex(
                name: "IX_Cours_NiveauId",
                table: "Cours");

            migrationBuilder.DropColumn(
                name: "NiveauId",
                table: "Cours");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Cours",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");
        }
    }
}
