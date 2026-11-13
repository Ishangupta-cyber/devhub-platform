"""Private-repository access rules for everything nested under a repository:
issues, pull requests, comments, wiki pages and project boards."""
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from rest_framework import status
from rest_framework.test import APITestCase

from comments.models import Comments
from organisations.models import Organisation, Membership
from projects.models import Project, Column
from pull_requests.models import Pull_Request
from repositories.models import Repository
from wiki.models import WikiPage
from .models import Issue

User = get_user_model()


class NestedPrivateRepoAccessTests(APITestCase):

    def setUp(self):
        self.owner = User.objects.create_user(username='owner', email='o@x.com', password='pass12345')
        self.member = User.objects.create_user(username='member', email='m@x.com', password='pass12345')
        self.stranger = User.objects.create_user(username='stranger', email='s@x.com', password='pass12345')

        org = Organisation.objects.create(name='acme')
        Membership.objects.create(organisation=org, user=self.owner, role='owner')
        Membership.objects.create(organisation=org, user=self.member, role='member')

        self.repo = Repository.objects.create(name='secret', owner=self.owner, organization=org, is_public=False)
        self.public = Repository.objects.create(name='open', owner=self.owner, is_public=True)

        self.issue = Issue.objects.create(repository=self.repo, created_by=self.owner, title='hidden bug')
        self.pr = Pull_Request.objects.create(repository=self.repo, created_by=self.owner, title='hidden pr')
        Comments.objects.create(
            content_type=ContentType.objects.get_for_model(Issue), object_id=self.issue.id,
            author=self.owner, content='hidden comment',
        )
        WikiPage.objects.create(repository=self.repo, created_by=self.owner, title='Hidden Page')
        self.project = Project.objects.create(repository=self.repo, name='roadmap')
        self.column = Column.objects.create(project=self.project, name='todo')

    def read_urls(self):
        r = self.repo.id
        return [
            f'/api/repositories/{r}/issues/',
            f'/api/repositories/{r}/issues/{self.issue.id}/',
            f'/api/repositories/{r}/pull-requests/',
            f'/api/repositories/{r}/pull-requests/{self.pr.id}/',
            f'/api/issues/{self.issue.id}/comments/',
            f'/api/repositories/{r}/wiki/',
            f'/api/repositories/{r}/wiki/hidden-page/',
            f'/api/repositories/{r}/projects/',
            f'/api/projects/{self.project.id}/columns/',
            f'/api/projects/columns/{self.column.id}/cards/',
        ]

    def test_stranger_gets_404_everywhere(self):
        self.client.force_authenticate(self.stranger)
        for url in self.read_urls():
            self.assertEqual(self.client.get(url).status_code, status.HTTP_404_NOT_FOUND, url)

    def test_anonymous_cannot_read(self):
        for url in self.read_urls():
            self.assertIn(self.client.get(url).status_code, (401, 403, 404), url)

    def test_org_member_can_read(self):
        self.client.force_authenticate(self.member)
        for url in self.read_urls():
            self.assertEqual(self.client.get(url).status_code, status.HTTP_200_OK, url)

    def test_stranger_cannot_open_issue_or_pr_on_private_repo(self):
        self.client.force_authenticate(self.stranger)
        r = self.repo.id
        self.assertEqual(self.client.post(f'/api/repositories/{r}/issues/', {'title': 'x'}).status_code, 404)
        self.assertEqual(self.client.post(f'/api/repositories/{r}/pull-requests/', {'title': 'x'}).status_code, 404)
        self.assertEqual(self.client.post(f'/api/issues/{self.issue.id}/comments/', {'content': 'x'}).status_code, 404)

    def test_anonymous_pr_create_is_rejected_not_500(self):
        resp = self.client.post(f'/api/repositories/{self.public.id}/pull-requests/', {'title': 'x'})
        self.assertIn(resp.status_code, (401, 403))

    def test_any_viewer_can_open_issue_on_public_repo(self):
        self.client.force_authenticate(self.stranger)
        resp = self.client.post(f'/api/repositories/{self.public.id}/issues/', {'title': 'bug'})
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_issue_author_can_close_own_issue(self):
        issue = Issue.objects.create(repository=self.public, created_by=self.stranger, title='mine')
        self.client.force_authenticate(self.stranger)
        resp = self.client.patch(f'/api/repositories/{self.public.id}/issues/{issue.id}/', {'status': 'closed'})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_other_user_cannot_close_someone_elses_issue(self):
        issue = Issue.objects.create(repository=self.public, created_by=self.owner, title='theirs')
        self.client.force_authenticate(self.stranger)
        resp = self.client.patch(f'/api/repositories/{self.public.id}/issues/{issue.id}/', {'status': 'closed'})
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_pr_author_cannot_approve_own_pr(self):
        pr = Pull_Request.objects.create(repository=self.public, created_by=self.stranger, title='p', status='review')
        self.client.force_authenticate(self.stranger)
        url = f'/api/repositories/{self.public.id}/pull-requests/{pr.id}/'
        self.assertEqual(self.client.patch(url, {'status': 'approved'}).status_code, 403)
        self.assertEqual(self.client.patch(url, {'status': 'draft'}).status_code, 200)

    def test_duplicate_wiki_title_is_400_not_500(self):
        self.client.force_authenticate(self.owner)
        resp = self.client.post(f'/api/repositories/{self.repo.id}/wiki/', {'title': 'Hidden Page'})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_profile_repo_list_hides_private_repos(self):
        self.client.force_authenticate(self.stranger)
        resp = self.client.get('/api/profiles/owner/repositories/')
        names = {r['name'] for r in resp.data}
        self.assertEqual(names, {'open'})

    def test_health_endpoint_is_public(self):
        self.assertEqual(self.client.get('/api/health/').status_code, 200)

    def test_register_still_works_without_auth(self):
        resp = self.client.post('/api/auth/register/', {
            'email': 'new@x.com', 'username': 'newbie', 'full_name': 'N',
            'password': 'S0me-long-pass!', 'password2': 'S0me-long-pass!',
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.data)

    def test_change_password_missing_field_is_400(self):
        self.client.force_authenticate(self.owner)
        resp = self.client.post('/api/auth/change-password/', {'old_password': 'pass12345'})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
