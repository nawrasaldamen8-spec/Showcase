#nullable disable

namespace Showcase.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "VerificationRequests",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DocumentUrl",
                table: "VerificationRequests",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IdentificationNumber",
                table: "VerificationRequests",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PortfolioUrl",
                table: "VerificationRequests",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WebsiteUrl",
                table: "VerificationRequests",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EmploymentType",
                table: "Experiences",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Experiences",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Academics",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Academics",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Countries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    Alpha2 = table.Column<string>(type: "character varying(2)", maxLength: 2, nullable: false),
                    Alpha3 = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Countries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LanguageReferences",
                columns: table => new
                {
                    Code = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LanguageReferences", x => x.Code);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Countries_Alpha2",
                table: "Countries",
                column: "Alpha2",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Countries_Alpha3",
                table: "Countries",
                column: "Alpha3",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Countries_Name",
                table: "Countries",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_LanguageReferences_Name",
                table: "LanguageReferences",
                column: "Name");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Countries");

            migrationBuilder.DropTable(
                name: "LanguageReferences");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "VerificationRequests");

            migrationBuilder.DropColumn(
                name: "DocumentUrl",
                table: "VerificationRequests");

            migrationBuilder.DropColumn(
                name: "IdentificationNumber",
                table: "VerificationRequests");

            migrationBuilder.DropColumn(
                name: "PortfolioUrl",
                table: "VerificationRequests");

            migrationBuilder.DropColumn(
                name: "WebsiteUrl",
                table: "VerificationRequests");

            migrationBuilder.DropColumn(
                name: "EmploymentType",
                table: "Experiences");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "Experiences");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Academics");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "Academics");
        }
    }
}
