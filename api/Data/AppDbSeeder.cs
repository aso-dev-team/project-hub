using System.Security.Cryptography;
using System.Text;
using LinearStyle.Api.Domain;
using LinearStyle.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace LinearStyle.Api.Data;

public sealed class AppDbSeeder
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<AppDbSeeder> _logger;
    private readonly IPasswordHasher _passwordHasher;

    public AppDbSeeder(AppDbContext dbContext, IPasswordHasher passwordHasher, ILogger<AppDbSeeder> logger)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _logger = logger;
    }

    public async Task InitializeAsync(CancellationToken cancellationToken)
    {
        // ひな型段階では EnsureCreated でブートストラップを優先しています。
        // schema が固まったら dotnet ef migrations add / database update に置き換えてください。
        await _dbContext.Database.EnsureCreatedAsync(cancellationToken);

        if (await _dbContext.Workspaces.AnyAsync(cancellationToken))
        {
            _logger.LogInformation("Database already contains seed data. Skip seeding.");
            return;
        }

        var now = DateTimeOffset.UtcNow;
        var workspace = new Workspace
        {
            Id = "workspace-primary",
            Name = "Acme Workspace"
        };

        var team = new Team
        {
            Id = "team-product",
            WorkspaceId = workspace.Id,
            Name = "Product",
            Key = "PRD"
        };

        var demoUser = new UserAccount
        {
            Id = "user-demo",
            Email = "demo@example.com",
            NormalizedEmail = NormalizeEmail("demo@example.com"),
            PasswordHash = _passwordHasher.Hash("demo123!"),
            DisplayName = "Demo User"
        };

        var designUser = new UserAccount
        {
            Id = "user-design",
            Email = "designer@example.com",
            NormalizedEmail = NormalizeEmail("designer@example.com"),
            PasswordHash = _passwordHasher.Hash("demo123!"),
            DisplayName = "Design Partner"
        };

        var memberships =
            new[]
            {
                new TeamMembership
                {
                    TeamId = team.Id,
                    UserId = demoUser.Id,
                    Role = "owner"
                },
                new TeamMembership
                {
                    TeamId = team.Id,
                    UserId = designUser.Id,
                    Role = "member"
                }
            };

        var projects = CreateProjects(team.Id);
        var statuses = CreateStatuses(projects);
        var labels = CreateLabels(projects);
        var issues = CreateIssues(projects, demoUser.Id, designUser.Id, now);
        var issueLabels = CreateIssueLabels(issues, labels);

        var pat = new PersonalAccessToken
        {
            Id = "pat-demo",
            UserId = demoUser.Id,
            Name = "Local readonly PAT",
            Hash = HashPat("pat_demo_readonly_local"),
            Scopes = ["read_api"],
            CreatedAt = now.AddDays(-14),
            LastUsedAt = now.AddDays(-1)
        };

        _dbContext.Workspaces.Add(workspace);
        _dbContext.Teams.Add(team);
        _dbContext.Users.AddRange(demoUser, designUser);
        _dbContext.TeamMemberships.AddRange(memberships);
        _dbContext.Projects.AddRange(projects);
        _dbContext.BoardStatuses.AddRange(statuses);
        _dbContext.Labels.AddRange(labels);
        _dbContext.Issues.AddRange(issues);
        _dbContext.IssueLabels.AddRange(issueLabels);
        _dbContext.PersonalAccessTokens.Add(pat);

        await _dbContext.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Demo seed data has been inserted into PostgreSQL.");
    }

    private static List<Project> CreateProjects(string teamId)
    {
        var projects = new List<Project>();

        for (var index = 0; index < 16; index++)
        {
            var projectId = index == 0 ? "project-roadmap" : $"project-seed-{index:D2}";
            var projectKey = index == 0 ? "ROAD" : $"OPS{index:D2}";
            var projectName = index == 0 ? "Roadmap" : $"Project Seed {index:D2}";

            projects.Add(
                new Project
                {
                    Id = projectId,
                    TeamId = teamId,
                    Key = projectKey,
                    Name = projectName,
                    Archived = false
                });
        }

        return projects;
    }

    private static List<BoardStatus> CreateStatuses(IEnumerable<Project> projects)
    {
        var statuses = new List<BoardStatus>();

        foreach (var project in projects)
        {
            statuses.AddRange(
            [
                new BoardStatus
                {
                    Id = $"{project.Id}-todo",
                    ProjectId = project.Id,
                    Key = "todo",
                    Name = "Todo",
                    Order = 0
                },
                new BoardStatus
                {
                    Id = $"{project.Id}-in-progress",
                    ProjectId = project.Id,
                    Key = "in_progress",
                    Name = "In Progress",
                    Order = 1
                },
                new BoardStatus
                {
                    Id = $"{project.Id}-done",
                    ProjectId = project.Id,
                    Key = "done",
                    Name = "Done",
                    Order = 2
                }
            ]);
        }

        return statuses;
    }

    private static List<Label> CreateLabels(IEnumerable<Project> projects)
    {
        var labels = new List<Label>();

        foreach (var project in projects)
        {
            labels.AddRange(
            [
                new Label
                {
                    Id = $"{project.Id}-triage",
                    ProjectId = project.Id,
                    Name = "triage",
                    Color = "#64748b"
                },
                new Label
                {
                    Id = $"{project.Id}-core",
                    ProjectId = project.Id,
                    Name = "core",
                    Color = "#6366f1"
                },
                new Label
                {
                    Id = $"{project.Id}-released",
                    ProjectId = project.Id,
                    Name = "released",
                    Color = "#22c55e"
                }
            ]);
        }

        return labels;
    }

    private static List<Issue> CreateIssues(
        IReadOnlyList<Project> projects,
        string demoUserId,
        string designUserId,
        DateTimeOffset now)
    {
        var roadmapProject = projects.First(project => project.Id == "project-roadmap");
        var issues =
            new List<Issue>
            {
                new()
                {
                    Id = "issue-road-01",
                    TeamId = roadmapProject.TeamId,
                    ProjectId = roadmapProject.Id,
                    Identifier = "ROAD-1",
                    Title = "Design keyboard-first command palette",
                    DescriptionHtml = "<p>Linear らしい操作感のために tinykeys と Command UI の境界を決めます。</p>",
                    State = "open",
                    StatusKey = "todo",
                    Order = "001000",
                    AssigneeUserId = demoUserId,
                    StartsAt = now.AddDays(-4),
                    TargetDate = now.AddDays(3),
                    CreatedAt = now.AddDays(-6),
                    UpdatedAt = now.AddDays(-1)
                },
                new()
                {
                    Id = "issue-road-02",
                    TeamId = roadmapProject.TeamId,
                    ProjectId = roadmapProject.Id,
                    Identifier = "ROAD-2",
                    Title = "Define issue move contract for Kanban updates",
                    DescriptionHtml = "<p>TanStack mutation と SignalR invalidate の責務を固定します。</p>",
                    State = "open",
                    StatusKey = "todo",
                    Order = "002000",
                    AssigneeUserId = designUserId,
                    StartsAt = now.AddDays(-2),
                    TargetDate = now.AddDays(7),
                    CreatedAt = now.AddDays(-5),
                    UpdatedAt = now.AddDays(-2)
                },
                new()
                {
                    Id = "issue-road-03",
                    TeamId = roadmapProject.TeamId,
                    ProjectId = roadmapProject.Id,
                    Identifier = "ROAD-3",
                    Title = "Implement Hot Chocolate board read model",
                    DescriptionHtml = "<p>board/list/timeline で UI 表示を切り替えやすい read surface を整えます。</p>",
                    State = "open",
                    StatusKey = "in_progress",
                    Order = "001000",
                    AssigneeUserId = demoUserId,
                    StartsAt = now.AddDays(-5),
                    TargetDate = now.AddDays(1),
                    CreatedAt = now.AddDays(-4),
                    UpdatedAt = now.AddHours(-10)
                },
                new()
                {
                    Id = "issue-road-04",
                    TeamId = roadmapProject.TeamId,
                    ProjectId = roadmapProject.Id,
                    Identifier = "ROAD-4",
                    Title = "Bootstrap PostgreSQL persistence for board data",
                    DescriptionHtml = "<p>EF Core で書き込みを寄せ、あとから read だけ Dapper に逃がせる形にします。</p>",
                    State = "open",
                    StatusKey = "in_progress",
                    Order = "002000",
                    AssigneeUserId = demoUserId,
                    StartsAt = now.AddDays(-3),
                    TargetDate = now.AddDays(5),
                    CreatedAt = now.AddDays(-3),
                    UpdatedAt = now.AddHours(-1)
                },
                new()
                {
                    Id = "issue-road-05",
                    TeamId = roadmapProject.TeamId,
                    ProjectId = roadmapProject.Id,
                    Identifier = "ROAD-5",
                    Title = "Ship project sidebar virtualization",
                    DescriptionHtml = "<p>react-virtual で project list を描画します。</p>",
                    State = "closed",
                    StatusKey = "done",
                    Order = "001000",
                    AssigneeUserId = designUserId,
                    StartsAt = now.AddDays(-8),
                    TargetDate = now.AddDays(-2),
                    CreatedAt = now.AddDays(-2),
                    UpdatedAt = now.AddHours(-12)
                }
            };

        foreach (var project in projects.Where(project => project.Id != roadmapProject.Id))
        {
            issues.Add(
                new Issue
                {
                    Id = $"issue-{project.Id}-01",
                    TeamId = project.TeamId,
                    ProjectId = project.Id,
                    Identifier = $"{project.Key}-1",
                    Title = $"{project.Name} - seed task",
                    DescriptionHtml = "<p>Sidebar virtualization 向けの seed issue です。</p>",
                    State = "open",
                    StatusKey = "todo",
                    Order = "001000",
                    AssigneeUserId = demoUserId,
                    StartsAt = null,
                    TargetDate = null,
                    CreatedAt = now.AddDays(-7),
                    UpdatedAt = now.AddDays(-7)
                });
        }

        return issues;
    }

    private static List<IssueLabel> CreateIssueLabels(IReadOnlyList<Issue> issues, IReadOnlyList<Label> labels)
    {
        var labelIndex = labels.ToDictionary(label => label.Id);
        var issueLabels = new List<IssueLabel>();

        foreach (var issue in issues)
        {
            var projectPrefix = issue.ProjectId;
            var labelId = issue.StatusKey == "done" ? $"{projectPrefix}-released" : $"{projectPrefix}-core";

            if (labelIndex.TryGetValue(labelId, out var label))
            {
                issueLabels.Add(
                    new IssueLabel
                    {
                        IssueId = issue.Id,
                        LabelId = label.Id
                    });
            }

            var triageId = $"{projectPrefix}-triage";
            if (labelIndex.TryGetValue(triageId, out var triageLabel) && issue.StatusKey != "done")
            {
                issueLabels.Add(
                    new IssueLabel
                    {
                        IssueId = issue.Id,
                        LabelId = triageLabel.Id
                    });
            }
        }

        return issueLabels;
    }

    private static string NormalizeEmail(string email)
    {
        return email.Trim().ToUpperInvariant();
    }

    private static string HashPat(string token)
    {
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
    }
}
