using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Teachers",
                columns: table => new
                {
                    TeacherCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TeacherName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Teachers", x => x.TeacherCode);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Password = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Role = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Subjects",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ClassCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ClassName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    SubjectName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Room = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    MaxStudent = table.Column<int>(type: "int", nullable: false),
                    TeacherCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Subjects", x => x.id);
                    table.ForeignKey(
                        name: "FK_Subjects_Teachers_TeacherCode",
                        column: x => x.TeacherCode,
                        principalTable: "Teachers",
                        principalColumn: "TeacherCode",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TeachingWeeks",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WeekNumber = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TeacherCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeachingWeeks", x => x.id);
                    table.ForeignKey(
                        name: "FK_TeachingWeeks_Teachers_TeacherCode",
                        column: x => x.TeacherCode,
                        principalTable: "Teachers",
                        principalColumn: "TeacherCode",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TeachingSessions",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DayOfWeek = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    TimeOfDay = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Period = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    PeriodBegin = table.Column<int>(type: "int", nullable: false),
                    PeriodEnd = table.Column<int>(type: "int", nullable: false),
                    TimeBegin = table.Column<TimeSpan>(type: "time", nullable: false),
                    TimeEnd = table.Column<TimeSpan>(type: "time", nullable: false),
                    TaughtLessons = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    TeachingWeekId = table.Column<int>(type: "int", nullable: false),
                    SubjectId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeachingSessions", x => x.id);
                    table.ForeignKey(
                        name: "FK_TeachingSessions_Subjects_SubjectId",
                        column: x => x.SubjectId,
                        principalTable: "Subjects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TeachingSessions_TeachingWeeks_TeachingWeekId",
                        column: x => x.TeachingWeekId,
                        principalTable: "TeachingWeeks",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Subjects_TeacherCode",
                table: "Subjects",
                column: "TeacherCode");

            migrationBuilder.CreateIndex(
                name: "IX_TeachingSessions_SubjectId",
                table: "TeachingSessions",
                column: "SubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_TeachingSessions_TeachingWeekId",
                table: "TeachingSessions",
                column: "TeachingWeekId");

            migrationBuilder.CreateIndex(
                name: "IX_TeachingWeeks_TeacherCode",
                table: "TeachingWeeks",
                column: "TeacherCode");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TeachingSessions");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Subjects");

            migrationBuilder.DropTable(
                name: "TeachingWeeks");

            migrationBuilder.DropTable(
                name: "Teachers");
        }
    }
}
