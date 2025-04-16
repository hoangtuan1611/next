using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SubjectLogs",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CurrentCount = table.Column<int>(type: "int", nullable: false),
                    CreateDate = table.Column<DateOnly>(type: "date", nullable: false),
                    CreateTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    ImgPath = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    TeachingSessionId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubjectLogs", x => x.id);
                    table.ForeignKey(
                        name: "FK_SubjectLogs_TeachingSessions_TeachingSessionId",
                        column: x => x.TeachingSessionId,
                        principalTable: "TeachingSessions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SubjectLogs_TeachingSessionId",
                table: "SubjectLogs",
                column: "TeachingSessionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SubjectLogs");
        }
    }
}
