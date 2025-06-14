// Data/AppDbContext.cs
using Microsoft.EntityFrameworkCore;
using TradingBackend.Models;
using TradingBackend.Models.Enums;

namespace TradingBackend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // DbSet for the Users table (existing)
        public DbSet<User> Users { get; set; } = default!; // Use default! for non-nullable property

        // DbSet for the new TradeHistory table
        public DbSet<TradeHistory> TradeHistories { get; set; } = default!;

        // DbSet for the new UserHoldings table
        public DbSet<UserHoldings> userHoldings { get; set; } = default!;

        public DbSet<PendingOrder> PendingOrders { get; set; } = default!;


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure the User entity (existing)
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id); // Primary key
                entity.Property(e => e.Username).IsRequired().HasMaxLength(255);
                entity.HasIndex(e => e.Username).IsUnique(); // Unique index for Username
                entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Email).HasMaxLength(255);
                entity.HasIndex(e => e.Email).IsUnique();

                // Configure 1-to-many relationship with TradeHistory
                entity.HasMany(u => u.TradeHistories)
                      .WithOne(t => t.User)
                      .HasForeignKey(t => t.UserId)
                      .OnDelete(DeleteBehavior.Cascade); // If a user is deleted, their trade history is also deleted

                // Configure 1-to-1 relationship with UserHolding
                entity.HasOne(u => u.UserHolding)
                      .WithOne(uh => uh.User)
                      .HasForeignKey<UserHoldings>(uh => uh.UserId)
                      .OnDelete(DeleteBehavior.Cascade); // If a user is deleted, their holdings are also deleted

                entity.HasMany(u => u.PendingOrders)
          .WithOne(po => po.User)
          .HasForeignKey(po => po.UserId)
          .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure the TradeHistory entity
            modelBuilder.Entity<TradeHistory>(entity =>
            {
                entity.ToTable("TradeHistory");

                entity.Property(t => t.Metal).HasConversion<string>(); // Map ENUM as string
                entity.Property(t => t.Action).HasConversion<string>(); // Map ENUM as string
                entity.Property(t => t.DateTime);
            });

            // Configure the UserHolding entity
            modelBuilder.Entity<UserHoldings>(entity =>
            {
                entity.ToTable("UserHoldings");

                entity.Property(uh => uh.LastUpdated);
                entity.Property(uh => uh.GoldHolding).HasDefaultValue(0);
                entity.Property(uh => uh.AverageGoldPrice).HasDefaultValue(0);
                entity.Property(uh => uh.SilverHolding).HasDefaultValue(0);
                entity.Property(uh => uh.AverageSilverPrice).HasDefaultValue(0);
                entity.Property(uh => uh.CashReserve).HasDefaultValue(0).IsRequired();
            });

            modelBuilder.Entity<PendingOrder>(entity =>
            {
                entity.ToTable("PendingOrders"); // Map to a table named PendingOrders
                entity.Property(po => po.Metal).HasConversion<string>(); // Store Metal enum as string
                entity.Property(po => po.Action).HasConversion<string>(); // Store Action enum as string
                entity.Property(po => po.Type).HasConversion<string>(); // Store OrderType enum as string
                entity.Property(po => po.Status).HasConversion<string>(); // Store OrderStatus enum as string
                entity.Property(po => po.TriggerPrice)
                      .HasColumnType("decimal(18, 4)"); 
            });
        }
    }
}
