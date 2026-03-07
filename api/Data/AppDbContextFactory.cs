using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace LinearStyle.Api.Data;

// dotnet-ef 用の design-time factory です。
// この環境では dotnet 実行ができないため migration 自動生成はしていませんが、CLI からすぐ切れる状態にしています。
public sealed class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__AppDb")
            ?? Environment.GetEnvironmentVariable("APP_DB_CONNECTION_STRING")
            ?? "Host=localhost;Port=5432;Database=linear_like;Username=postgres;Password=postgres";

        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder.UseNpgsql(connectionString);

        return new AppDbContext(optionsBuilder.Options);
    }
}
