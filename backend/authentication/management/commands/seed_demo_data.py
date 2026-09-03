import datetime
import random

from django.contrib.contenttypes.models import ContentType
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from authentication.models import User
from profiles.models import Follow
from repositories.models import Repository
from repositories.services import create_repository
from issues.models import Issue
from issues.services import create_issue
from pull_requests.models import Pull_Request
from pull_requests.services import create_pull_request
from comments.models import Comments
from comments.services import create_comment
from projects.services import create_project, create_column, add_card
from wiki.services import create_wiki_page
from activity.models import Activity
from notifications.models import Notification


DEMO_PASSWORD = "Demo@1234"
ADMIN_PASSWORD = "Admin@12345"

DEMO_USERS = [
    {"email": "admin@devhub.local", "username": "admin", "full_name": "DevHub Admin",
     "bio": "Platform administrator.", "password": ADMIN_PASSWORD, "superuser": True},
    {"email": "alice@devhub.local", "username": "alice_dev", "full_name": "Alice Sharma",
     "bio": "Backend engineer. Loves Django and clean APIs.", "password": DEMO_PASSWORD},
    {"email": "bob@devhub.local", "username": "bob_builder", "full_name": "Bob Mehta",
     "bio": "Frontend developer working on React dashboards.", "password": DEMO_PASSWORD},
    {"email": "priya@devhub.local", "username": "priya_codes", "full_name": "Priya Nair",
     "bio": "ML engineer, into data pipelines and automation.", "password": DEMO_PASSWORD},
    {"email": "arjun@devhub.local", "username": "arjun_ships", "full_name": "Arjun Verma",
     "bio": "Mobile developer shipping cross-platform apps.", "password": DEMO_PASSWORD},
]

REPO_DEFS = [
    {"owner": "alice_dev", "name": "devhub-api", "description": "Core REST API powering the DevHub platform."},
    {"owner": "alice_dev", "name": "auth-service", "description": "Standalone authentication & JWT microservice."},
    {"owner": "bob_builder", "name": "react-dashboard", "description": "Admin dashboard built with React + Tailwind."},
    {"owner": "bob_builder", "name": "design-system", "description": "Shared UI component library for internal apps."},
    {"owner": "priya_codes", "name": "ml-pipeline", "description": "Training pipeline for the recommendation model."},
    {"owner": "arjun_ships", "name": "mobile-app", "description": "Cross-platform mobile client built with React Native."},
]

ISSUE_TITLES = [
    ("Fix JWT refresh token expiry bug", "closed"),
    ("Add pagination to list endpoints", "open"),
    ("N+1 query on repository list view", "open"),
    ("CORS error when calling API from localhost", "closed"),
    ("Improve error messages for validation failures", "open"),
    ("Flaky test in CI pipeline", "closed"),
    ("Dark mode toggle not persisting", "open"),
    ("Memory leak in websocket connection", "open"),
    ("Update dependency versions for security patch", "closed"),
    ("Add rate limiting to public endpoints", "open"),
]

PR_TITLES_BY_STATUS = [
    ("Add pagination support to repository API", "merged"),
    ("Refactor authentication middleware", "approved"),
    ("Fix column reordering bug on kanban board", "review"),
    ("Add dark mode support", "draft"),
    ("Improve test coverage for issues app", "merged"),
    ("Optimize database queries for dashboard", "review"),
]

COMMENT_TEXTS = [
    "Thanks for reporting, looking into this now.",
    "Can confirm this happens on my machine too.",
    "This should be fixed in the latest commit, can you verify?",
    "Nice catch! Merging this in.",
    "Left a couple of suggestions inline, otherwise looks good.",
    "Can we add a test case for this before merging?",
    "Resolved in the latest push, closing this out.",
]

COLUMN_NAMES = ["Backlog", "In Progress", "Review", "Done"]


class Command(BaseCommand):
    help = "Seeds the database with demo data (users, repositories, issues, PRs, comments, project boards)."

    def handle(self, *args, **options):
        random.seed(42)

        with transaction.atomic():
            users_by_username = self._seed_users()
            repos = self._seed_repositories(users_by_username)
            all_usernames = list(users_by_username.keys())
            issues = self._seed_issues(repos, users_by_username, all_usernames)
            prs = self._seed_pull_requests(repos, users_by_username, all_usernames)
            self._seed_comments(issues, prs, users_by_username, all_usernames)
            self._seed_projects(repos, issues, prs)
            self._seed_follows(users_by_username)
            self._seed_wiki_pages(repos)
            self._backfill_activity()
            self._seed_notifications()

        self.stdout.write(self.style.SUCCESS("\nDemo data seeded successfully.\n"))
        self.stdout.write("Login credentials:")
        self.stdout.write(f"  Admin (Django admin + site login): admin@devhub.local / {ADMIN_PASSWORD}")
        self.stdout.write(f"  Demo users (all share the same password): {DEMO_PASSWORD}")
        for u in DEMO_USERS:
            if not u.get("superuser"):
                self.stdout.write(f"    - {u['email']} (username: {u['username']})")

    def _seed_users(self):
        users = {}
        for u in DEMO_USERS:
            user = User.objects.filter(email=u["email"]).first()
            if not user:
                if u.get("superuser"):
                    user = User.objects.create_superuser(
                        email=u["email"], username=u["username"], password=u["password"]
                    )
                else:
                    user = User.objects.create_user(
                        email=u["email"], username=u["username"], password=u["password"]
                    )
                user.full_name = u["full_name"]
                user.bio = u["bio"]
                user.is_verified = True
                user.save()
                self.stdout.write(f"Created user: {user.username} ({user.email})")
            users[user.username] = user
        return users

    def _seed_repositories(self, users_by_username):
        repos = []
        for r in REPO_DEFS:
            owner = users_by_username[r["owner"]]
            repo = owner.repositories.filter(name=r["name"]).first()
            if not repo:
                repo = create_repository(owner=owner, name=r["name"], description=r["description"])
                self.stdout.write(f"Created repository: {repo.owner.username}/{repo.name}")
            repos.append(repo)
        return repos

    def _seed_issues(self, repos, users_by_username, all_usernames):
        issues = []
        if any(repo.issues.exists() for repo in repos):
            return list(sum((list(repo.issues.all()) for repo in repos), []))

        for repo in repos:
            sample = random.sample(ISSUE_TITLES, k=4)
            for title, status in sample:
                creator = users_by_username[random.choice(all_usernames)]
                issue = create_issue(
                    repository=repo, created_by=creator,
                    title=title, description=f"{title}. Reported against {repo.name}."
                )
                issue.status = status
                issue.save()
                issues.append(issue)
        self.stdout.write(f"Created {len(issues)} issues.")
        return issues

    def _seed_pull_requests(self, repos, users_by_username, all_usernames):
        prs = []
        if any(repo.pull_requests.exists() for repo in repos):
            return list(sum((list(repo.pull_requests.all()) for repo in repos), []))

        for repo in repos:
            sample = random.sample(PR_TITLES_BY_STATUS, k=3)
            for title, status in sample:
                creator = users_by_username[random.choice(all_usernames)]
                pr = create_pull_request(
                    repository=repo, created_by=creator,
                    title=title, description=f"{title} for {repo.name}."
                )
                pr.status = status
                pr.save()
                prs.append(pr)
        self.stdout.write(f"Created {len(prs)} pull requests.")
        return prs

    def _seed_comments(self, issues, prs, users_by_username, all_usernames):
        if not issues and not prs:
            return
        from comments.models import Comments
        if Comments.objects.exists():
            return

        count = 0
        for target in issues + prs:
            for _ in range(random.randint(1, 3)):
                author = users_by_username[random.choice(all_usernames)]
                create_comment(
                    content_object=target, author=author,
                    content=random.choice(COMMENT_TEXTS)
                )
                count += 1
        self.stdout.write(f"Created {count} comments.")

    def _seed_projects(self, repos, issues, prs):
        if any(repo.projects.exists() for repo in repos):
            return

        issues_by_repo = {}
        for issue in issues:
            issues_by_repo.setdefault(issue.repository_id, []).append(issue)
        prs_by_repo = {}
        for pr in prs:
            prs_by_repo.setdefault(pr.repository_id, []).append(pr)

        project_count = 0
        column_count = 0
        card_count = 0
        for repo in repos:
            project = create_project(name="Sprint Board", repository=repo)
            project_count += 1
            columns = []
            for i, name in enumerate(COLUMN_NAMES):
                column = create_column(name=name, project=project, position=(i + 1) * 10)
                columns.append(column)
                column_count += 1

            cards = []
            for issue in issues_by_repo.get(repo.id, []):
                col = columns[0] if issue.status == "open" else columns[-1]
                cards.append(("issue", issue.id, col))
            for pr in prs_by_repo.get(repo.id, []):
                status_to_col = {"draft": 0, "review": 2, "approved": 2, "merged": 3}
                col = columns[status_to_col.get(pr.status, 0)]
                cards.append(("pull_request", pr.id, col))

            for link_type, link_id, col in cards:
                add_card(link_id=link_id, link_type=link_type, column=col)
                card_count += 1

        self.stdout.write(f"Created {project_count} project boards, {column_count} columns, {card_count} cards.")

    def _seed_follows(self, users_by_username):
        usernames = list(users_by_username.keys())
        created = 0
        for username in usernames:
            others = [u for u in usernames if u != username]
            for target in random.sample(others, k=min(2, len(others))):
                _, was_created = Follow.objects.get_or_create(
                    follower=users_by_username[username],
                    following=users_by_username[target],
                )
                if was_created:
                    created += 1
        self.stdout.write(f"Created {created} follow relationships.")

    def _seed_wiki_pages(self, repos):
        created = 0
        for repo in repos:
            if repo.wiki_pages.exists():
                continue
            pages = [
                ("Home",
                 f"# {repo.name}\n\n{repo.description}\n\n"
                 f"Welcome to the **{repo.name}** wiki. Use the sidebar to find setup "
                 f"instructions, architecture notes, and contribution guidelines."),
                ("Getting Started",
                 "# Getting Started\n\n"
                 "1. Clone the repository: `git clone <url>`\n"
                 "2. Install dependencies.\n"
                 "3. Copy `.env.example` to `.env` and fill in the required values.\n"
                 "4. Run the project locally and open a pull request for any changes.\n\n"
                 f"Maintained by @{repo.owner.username}."),
                ("Architecture",
                 "# Architecture Overview\n\n"
                 f"`{repo.name}` is organized around a small set of core modules. "
                 "Check open issues and pull requests for ongoing design discussions "
                 "before proposing large structural changes."),
            ]
            for title, content in pages:
                create_wiki_page(title=title, repository=repo, created_by=repo.owner, content=content)
                created += 1
        self.stdout.write(f"Created {created} wiki pages.")

    def _backfill_activity(self):
        """Activity rows are normally queued to Celery via signals, but no worker
        may have been running to consume them. Fill in any missing entries directly
        so the activity feed reflects everything that already exists in the DB."""
        repo_ct = ContentType.objects.get_for_model(Repository)
        issue_ct = ContentType.objects.get_for_model(Issue)
        user_ct = ContentType.objects.get_for_model(User)
        now = timezone.now()

        existing_repo_ids = set(
            Activity.objects.filter(verb='created_repository', content_type=repo_ct)
            .values_list('object_id', flat=True)
        )
        existing_issue_ids = set(
            Activity.objects.filter(verb='created_issue', content_type=issue_ct)
            .values_list('object_id', flat=True)
        )
        existing_follows = set(
            Activity.objects.filter(verb='followed', content_type=user_ct)
            .values_list('actor_id', 'object_id')
        )

        created = 0
        for repo in Repository.objects.all():
            if repo.id in existing_repo_ids:
                continue
            ts = min(repo.created_at + datetime.timedelta(minutes=random.randint(0, 5)), now)
            activity = Activity.objects.create(
                actor=repo.owner, verb='created_repository', content_type=repo_ct, object_id=repo.id
            )
            Activity.objects.filter(pk=activity.pk).update(created_at=ts)
            created += 1

        for issue in Issue.objects.all():
            if issue.id in existing_issue_ids:
                continue
            ts = min(issue.created_at + datetime.timedelta(minutes=random.randint(0, 5)), now)
            activity = Activity.objects.create(
                actor=issue.created_by, verb='created_issue', content_type=issue_ct, object_id=issue.id
            )
            Activity.objects.filter(pk=activity.pk).update(created_at=ts)
            created += 1

        for follow in Follow.objects.all():
            if (follow.follower_id, follow.following_id) in existing_follows:
                continue
            ts = min(follow.created_at + datetime.timedelta(minutes=random.randint(0, 5)), now)
            activity = Activity.objects.create(
                actor=follow.follower, verb='followed', content_type=user_ct, object_id=follow.following_id
            )
            Activity.objects.filter(pk=activity.pk).update(created_at=ts)
            created += 1

        self.stdout.write(f"Backfilled {created} activity feed entries.")

    def _seed_notifications(self):
        if Notification.objects.exists():
            return

        user_ct = ContentType.objects.get_for_model(User)
        created = 0

        for comment in Comments.objects.select_related('author').all():
            target = comment.content_object
            owner = getattr(target, 'created_by', None)
            if owner is None or owner.id == comment.author_id:
                continue
            notif = Notification.objects.create(
                recipient=owner,
                actor=comment.author,
                verb='commented',
                content_type=comment.content_type,
                object_id=comment.object_id,
                is_read=random.random() < 0.4,
            )
            Notification.objects.filter(pk=notif.pk).update(created_at=comment.created_at)
            created += 1

        for follow in Follow.objects.all():
            notif = Notification.objects.create(
                recipient=follow.following,
                actor=follow.follower,
                verb='followed',
                content_type=user_ct,
                object_id=follow.follower_id,
                is_read=random.random() < 0.4,
            )
            Notification.objects.filter(pk=notif.pk).update(created_at=follow.created_at)
            created += 1

        self.stdout.write(f"Created {created} notifications.")
