using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Showcase.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSpecialtyReferencesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PreviousRefreshToken",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PreviousRefreshTokenExpiryTime",
                table: "AspNetUsers",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "SpecialtyReferences",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    Code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Category = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    SubField = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpecialtyReferences", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SpecialtyReferences_Category",
                table: "SpecialtyReferences",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_SpecialtyReferences_Name",
                table: "SpecialtyReferences",
                column: "Name");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SpecialtyReferences");

            migrationBuilder.DropColumn(
                name: "PreviousRefreshToken",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "PreviousRefreshTokenExpiryTime",
                table: "AspNetUsers");
        }
    }
}
