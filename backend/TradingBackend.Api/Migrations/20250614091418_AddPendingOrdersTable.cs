using System;
using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

namespace TradingBackend.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPendingOrdersTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    Username = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    PasswordHash = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    Email = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "PendingOrders",
                columns: table => new
                {
                    OrderId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Metal = table.Column<string>(type: "varchar(10)", nullable: false),
                    Action = table.Column<string>(type: "varchar(10)", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    TriggerPrice = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    Type = table.Column<string>(type: "varchar(10)", nullable: false),
                    Status = table.Column<string>(type: "varchar(10)", nullable: false),
                    PlacedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    ExecutedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    FailureReason = table.Column<string>(type: "longtext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PendingOrders", x => x.OrderId);
                    table.ForeignKey(
                        name: "FK_PendingOrders_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "TradeHistory",
                columns: table => new
                {
                    TradeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Metal = table.Column<string>(type: "varchar(10)", nullable: false),
                    Action = table.Column<string>(type: "varchar(10)", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Price = table.Column<int>(type: "int", nullable: false),
                    DateTime = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TradeHistory", x => x.TradeId);
                    table.ForeignKey(
                        name: "FK_TradeHistory_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "UserHoldings",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false),
                    GoldHolding = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    AverageGoldPrice = table.Column<decimal>(type: "decimal(18,4)", nullable: false, defaultValue: 0m),
                    SilverHolding = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    AverageSilverPrice = table.Column<decimal>(type: "decimal(18,4)", nullable: false, defaultValue: 0m),
                    CashReserve = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    LastUpdated = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserHoldings", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_UserHoldings_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_PendingOrders_UserId",
                table: "PendingOrders",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_TradeHistory_UserId",
                table: "TradeHistory",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PendingOrders");

            migrationBuilder.DropTable(
                name: "TradeHistory");

            migrationBuilder.DropTable(
                name: "UserHoldings");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
