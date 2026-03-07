using LinearStyle.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace LinearStyle.Api.Data;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Workspace> Workspaces => Set<Workspace>();

    public DbSet<Team> Teams => Set<Team>();

    public DbSet<Project> Projects => Set<Project>();

    public DbSet<BoardStatus> BoardStatuses => Set<BoardStatus>();

    public DbSet<Label> Labels => Set<Label>();

    public DbSet<Issue> Issues => Set<Issue>();

    public DbSet<IssueLabel> IssueLabels => Set<IssueLabel>();

    public DbSet<UserAccount> Users => Set<UserAccount>();

    public DbSet<TeamMembership> TeamMemberships => Set<TeamMembership>();

    public DbSet<PersonalAccessToken> PersonalAccessTokens => Set<PersonalAccessToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Workspace>(builder =>
        {
            builder.HasKey(workspace => workspace.Id);
            builder.Property(workspace => workspace.Id).HasMaxLength(64);
            builder.Property(workspace => workspace.Name).HasMaxLength(200);
        });

        modelBuilder.Entity<Team>(builder =>
        {
            builder.HasKey(team => team.Id);
            builder.Property(team => team.Id).HasMaxLength(64);
            builder.Property(team => team.WorkspaceId).HasMaxLength(64);
            builder.Property(team => team.Name).HasMaxLength(200);
            builder.Property(team => team.Key).HasMaxLength(32);
            builder.HasIndex(team => new { team.WorkspaceId, team.Key }).IsUnique();
            builder
                .HasOne(team => team.Workspace)
                .WithMany(workspace => workspace.Teams)
                .HasForeignKey(team => team.WorkspaceId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Project>(builder =>
        {
            builder.HasKey(project => project.Id);
            builder.Property(project => project.Id).HasMaxLength(64);
            builder.Property(project => project.TeamId).HasMaxLength(64);
            builder.Property(project => project.Name).HasMaxLength(200);
            builder.Property(project => project.Key).HasMaxLength(32);
            builder.HasIndex(project => new { project.TeamId, project.Key }).IsUnique();
            builder
                .HasOne(project => project.Team)
                .WithMany(team => team.Projects)
                .HasForeignKey(project => project.TeamId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<BoardStatus>(builder =>
        {
            builder.HasKey(status => status.Id);
            builder.Property(status => status.Id).HasMaxLength(80);
            builder.Property(status => status.ProjectId).HasMaxLength(64);
            builder.Property(status => status.Key).HasMaxLength(32);
            builder.Property(status => status.Name).HasMaxLength(100);
            builder.HasIndex(status => new { status.ProjectId, status.Key }).IsUnique();
            builder
                .HasOne(status => status.Project)
                .WithMany(project => project.Statuses)
                .HasForeignKey(status => status.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Label>(builder =>
        {
            builder.HasKey(label => label.Id);
            builder.Property(label => label.Id).HasMaxLength(80);
            builder.Property(label => label.ProjectId).HasMaxLength(64);
            builder.Property(label => label.Name).HasMaxLength(100);
            builder.Property(label => label.Color).HasMaxLength(16);
            builder.HasIndex(label => new { label.ProjectId, label.Name }).IsUnique();
            builder
                .HasOne(label => label.Project)
                .WithMany(project => project.Labels)
                .HasForeignKey(label => label.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Issue>(builder =>
        {
            builder.HasKey(issue => issue.Id);
            builder.Property(issue => issue.Id).HasMaxLength(80);
            builder.Property(issue => issue.TeamId).HasMaxLength(64);
            builder.Property(issue => issue.ProjectId).HasMaxLength(64);
            builder.Property(issue => issue.Identifier).HasMaxLength(64);
            builder.Property(issue => issue.Title).HasMaxLength(300);
            builder.Property(issue => issue.DescriptionHtml).HasColumnType("text");
            builder.Property(issue => issue.State).HasMaxLength(32);
            builder.Property(issue => issue.StatusKey).HasMaxLength(32);
            builder.Property(issue => issue.Order).HasMaxLength(32);
            builder.Property(issue => issue.AssigneeUserId).HasMaxLength(64);
            builder.HasIndex(issue => new { issue.ProjectId, issue.Identifier }).IsUnique();
            builder.HasIndex(issue => new { issue.ProjectId, issue.StatusKey, issue.Order });
            builder
                .HasOne(issue => issue.Project)
                .WithMany(project => project.Issues)
                .HasForeignKey(issue => issue.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
            builder
                .HasOne(issue => issue.Assignee)
                .WithMany(user => user.AssignedIssues)
                .HasForeignKey(issue => issue.AssigneeUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<IssueLabel>(builder =>
        {
            builder.HasKey(issueLabel => new { issueLabel.IssueId, issueLabel.LabelId });
            builder.Property(issueLabel => issueLabel.IssueId).HasMaxLength(80);
            builder.Property(issueLabel => issueLabel.LabelId).HasMaxLength(80);
            builder
                .HasOne(issueLabel => issueLabel.Issue)
                .WithMany(issue => issue.IssueLabels)
                .HasForeignKey(issueLabel => issueLabel.IssueId)
                .OnDelete(DeleteBehavior.Cascade);
            builder
                .HasOne(issueLabel => issueLabel.Label)
                .WithMany(label => label.IssueLabels)
                .HasForeignKey(issueLabel => issueLabel.LabelId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<UserAccount>(builder =>
        {
            builder.HasKey(user => user.Id);
            builder.Property(user => user.Id).HasMaxLength(64);
            builder.Property(user => user.Email).HasMaxLength(200);
            builder.Property(user => user.NormalizedEmail).HasMaxLength(200);
            builder.Property(user => user.PasswordHash).HasMaxLength(512);
            builder.Property(user => user.DisplayName).HasMaxLength(200);
            builder.HasIndex(user => user.NormalizedEmail).IsUnique();
        });

        modelBuilder.Entity<TeamMembership>(builder =>
        {
            builder.HasKey(membership => new { membership.TeamId, membership.UserId });
            builder.Property(membership => membership.TeamId).HasMaxLength(64);
            builder.Property(membership => membership.UserId).HasMaxLength(64);
            builder.Property(membership => membership.Role).HasMaxLength(50);
            builder
                .HasOne(membership => membership.Team)
                .WithMany(team => team.Memberships)
                .HasForeignKey(membership => membership.TeamId)
                .OnDelete(DeleteBehavior.Cascade);
            builder
                .HasOne(membership => membership.User)
                .WithMany(user => user.Memberships)
                .HasForeignKey(membership => membership.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PersonalAccessToken>(builder =>
        {
            builder.HasKey(token => token.Id);
            builder.Property(token => token.Id).HasMaxLength(80);
            builder.Property(token => token.UserId).HasMaxLength(64);
            builder.Property(token => token.Name).HasMaxLength(200);
            builder.Property(token => token.Hash).HasMaxLength(128);
            builder.Property(token => token.Scopes).HasColumnType("text[]");
            builder.HasIndex(token => token.Hash).IsUnique();
            builder
                .HasOne(token => token.User)
                .WithMany(user => user.PersonalAccessTokens)
                .HasForeignKey(token => token.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
