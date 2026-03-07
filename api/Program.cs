using System.Text.Json;
using LinearStyle.Api.Data;
using LinearStyle.Api.GraphQL;
using LinearStyle.Api.Hubs;
using LinearStyle.Api.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var webOrigin = builder.Configuration["Web:Origin"]
    ?? builder.Configuration["Frontend:Origin"]
    ?? "http://localhost:3000";
var connectionString = builder.Configuration.GetConnectionString("AppDb")
    ?? "Host=localhost;Port=5432;Database=linear_like;Username=postgres;Password=postgres";

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "WebClient",
        policy =>
        {
            policy
                .WithOrigins(webOrigin)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
});

builder.Services
    .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(
        options =>
        {
            options.Cookie.Name = "linear_like.session";
            options.Cookie.HttpOnly = true;
            options.Cookie.SameSite = SameSiteMode.Lax;
            options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
            options.Events = new CookieAuthenticationEvents
            {
                OnRedirectToLogin = context =>
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    return Task.CompletedTask;
                },
                OnRedirectToAccessDenied = context =>
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    return Task.CompletedTask;
                }
            };
        });

builder.Services.AddAuthorization();
builder.Services.AddProblemDetails();
builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddHttpContextAccessor();

builder.Services.AddDbContext<AppDbContext>(
    options =>
    {
        options.UseNpgsql(connectionString);

        if (builder.Environment.IsDevelopment())
        {
            options.EnableDetailedErrors();
            options.EnableSensitiveDataLogging();
        }
    });

builder.Services.AddGraphQLServer()
    .ModifyRequestOptions(
        options =>
        {
            options.IncludeExceptionDetails = builder.Environment.IsDevelopment();
        })
    .AddQueryType<AppQuery>();

builder.Services.AddScoped<AppDbSeeder>();
builder.Services.AddScoped<IUserSessionService, UserSessionService>();
builder.Services.AddScoped<IBoardQueryService, BoardQueryService>();
builder.Services.AddScoped<IIssueCommandService, IssueCommandService>();
builder.Services.AddScoped<IPatService, PatService>();
builder.Services.AddSingleton<IPasswordHasher, Pbkdf2PasswordHasher>();
builder.Services.AddSingleton<IRealtimeNotifier, SignalRRealtimeNotifier>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<AppDbSeeder>();
    await seeder.InitializeAsync(CancellationToken.None);
}

app.UseExceptionHandler(
    exceptionHandlerApplication =>
    {
        exceptionHandlerApplication.Run(
            async context =>
            {
                var exceptionFeature = context.Features.Get<IExceptionHandlerFeature>();
                var exception = exceptionFeature?.Error;

                var statusCode = exception switch
                {
                    UnauthorizedAccessException => StatusCodes.Status403Forbidden,
                    InvalidOperationException => StatusCodes.Status400BadRequest,
                    _ => StatusCodes.Status500InternalServerError
                };

                context.Response.ContentType = "application/problem+json";
                context.Response.StatusCode = statusCode;

                var problemDetails = new ProblemDetails
                {
                    Status = statusCode,
                    Title = "Request failed",
                    Detail = exception?.Message ?? "Unexpected server error."
                };

                await context.Response.WriteAsync(JsonSerializer.Serialize(problemDetails));
            });
    });

app.UseCors("WebClient");
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/healthz", () => Results.Ok(new { status = "ok" }));
app.MapControllers();
app.MapGraphQL("/graphql").RequireAuthorization();
app.MapHub<BoardHub>("/hubs/board");

app.Run();
