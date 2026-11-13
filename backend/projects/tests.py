from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from issues.models import Issue
from repositories.models import Repository
from .models import Project, Column, Card

User = get_user_model()


class BoardTests(APITestCase):

    def setUp(self):
        self.owner = User.objects.create_user(username='owner', email='o@x.com', password='pass12345')
        self.repo = Repository.objects.create(name='app', owner=self.owner)
        self.other_repo = Repository.objects.create(name='elsewhere', owner=self.owner, is_public=False)
        self.project = Project.objects.create(repository=self.repo, name='board')
        self.todo = Column.objects.create(project=self.project, name='todo', position=10)
        self.done = Column.objects.create(project=self.project, name='done', position=20)
        self.issues = [Issue.objects.create(repository=self.repo, created_by=self.owner, title=f'i{n}') for n in range(3)]
        self.client.force_authenticate(self.owner)

    def add(self, column, issue):
        return self.client.post(f'/api/projects/columns/{column.id}/cards/', {'link_type': 'issue', 'link_id': issue.id})

    def test_card_move_to_other_column_persists(self):
        card_id = self.add(self.todo, self.issues[0]).data['id']
        resp = self.client.patch(f'/api/projects/columns/{self.todo.id}/cards/{card_id}/', {'column': self.done.id, 'position': 10})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(Card.objects.get(id=card_id).column_id, self.done.id)

    def test_cannot_move_card_into_another_projects_column(self):
        other = Column.objects.create(project=Project.objects.create(repository=self.repo, name='p2'), name='x')
        card_id = self.add(self.todo, self.issues[0]).data['id']
        resp = self.client.patch(f'/api/projects/columns/{self.todo.id}/cards/{card_id}/', {'column': other.id})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_position_collision_is_renumbered_keeping_order(self):
        ids = [self.add(self.todo, i).data['id'] for i in self.issues]  # positions 10, 20, 30
        last = ids[2]
        # drop the last card onto the first one's position -> should land first
        self.client.patch(f'/api/projects/columns/{self.todo.id}/cards/{last}/', {'position': 10})
        order = list(Card.objects.filter(column=self.todo).order_by('position').values_list('id', flat=True))
        self.assertEqual(order, [last, ids[0], ids[1]])
        positions = list(Card.objects.filter(column=self.todo).order_by('position').values_list('position', flat=True))
        self.assertEqual(len(set(positions)), 3)

    def test_cannot_link_issue_from_another_repository(self):
        foreign = Issue.objects.create(repository=self.other_repo, created_by=self.owner, title='private title')
        resp = self.add(self.todo, foreign)
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_card_without_link_fields_is_400(self):
        resp = self.client.post(f'/api/projects/columns/{self.todo.id}/cards/', {})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_column_without_position_gets_appended(self):
        resp = self.client.post(f'/api/projects/{self.project.id}/columns/', {'name': 'review'})
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['position'], 30)
