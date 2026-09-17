from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from organisations.models import Organisation, Membership
from repositories.models import Repository
from .models import FileNode

User = get_user_model()


class FileNodeAPITests(APITestCase):

    def setUp(self):
        self.owner = User.objects.create_user(
            username='owner', email='owner@example.com', password='pass12345'
        )
        self.stranger = User.objects.create_user(
            username='stranger', email='stranger@example.com', password='pass12345'
        )

        self.repo = Repository.objects.create(name='devhub', owner=self.owner)
        self.other_repo = Repository.objects.create(name='other', owner=self.stranger)

        self.src = FileNode.objects.create(
            repository=self.repo, name='src', node_type=FileNode.NodeType.FOLDER
        )
        self.button = FileNode.objects.create(
            repository=self.repo, parent=self.src, name='Button.jsx',
            node_type=FileNode.NodeType.FILE, content='export default Button',
        )
        self.other_folder = FileNode.objects.create(
            repository=self.other_repo, name='secret',
            node_type=FileNode.NodeType.FOLDER,
        )

        self.tree_url = f'/api/repositories/{self.repo.pk}/tree/'

    def detail_url(self, node_id):
        return f'/api/repositories/{self.repo.pk}/files/{node_id}/'

    def as_owner(self):
        self.client.force_authenticate(user=self.owner)

    # Test 1 - root pe file banao
    def test_create_file_at_root(self):
        self.as_owner()
        res = self.client.post(self.tree_url, {
            'name': 'index.js',
            'node_type': 'file',
            'content': "console.log('hi')",
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.data)
        self.assertEqual(res.data['path'], 'index.js')
        self.assertEqual(res.data['content'], "console.log('hi')")

    # Test 2 - folder ke andar
    def test_create_file_inside_folder(self):
        self.as_owner()
        res = self.client.post(self.tree_url, {
            'name': 'api.js',
            'node_type': 'file',
            'parent': self.src.pk,
            'content': '// api',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.data)
        self.assertEqual(res.data['path'], 'src/api.js')

    # Test 3 - duplicate -> 400 (500 nahi!)
    def test_duplicate_name_returns_400(self):
        self.as_owner()
        payload = {'name': 'index.js', 'node_type': 'file'}
        self.client.post(self.tree_url, payload, format='json')
        res = self.client.post(self.tree_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST, res.data)
        self.assertIn('pehle se maujood hai', str(res.data))

    # Test 4 - file ke andar file
    def test_parent_must_be_folder(self):
        self.as_owner()
        res = self.client.post(self.tree_url, {
            'name': 'x.js', 'node_type': 'file', 'parent': self.button.pk,
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST, res.data)
        self.assertIn('folder hona chahiye', str(res.data))

    # Test 5 - invalid node_type
    def test_invalid_node_type(self):
        self.as_owner()
        res = self.client.post(self.tree_url, {
            'name': 'x.js', 'node_type': 'flie',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST, res.data)
        self.assertIn('node_type', res.data)

    # Test 6 - content save
    def test_patch_content(self):
        self.as_owner()
        res = self.client.patch(self.detail_url(self.button.pk), {
            'content': 'const x = 42;',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)
        self.assertEqual(res.data['content'], 'const x = 42;')
        self.button.refresh_from_db()
        self.assertEqual(self.button.content, 'const x = 42;')

    # Test 7 - rename
    def test_patch_rename(self):
        self.as_owner()
        res = self.client.patch(self.detail_url(self.button.pk), {
            'name': 'renamed.js',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)
        self.assertEqual(res.data['name'], 'renamed.js')
        self.assertEqual(res.data['path'], 'src/renamed.js')
        # content chhua nahi gaya
        self.button.refresh_from_db()
        self.assertEqual(self.button.content, 'export default Button')

    def test_patch_rename_to_existing_sibling_returns_400(self):
        self.as_owner()
        FileNode.objects.create(
            repository=self.repo, parent=self.src, name='taken.js',
            node_type=FileNode.NodeType.FILE,
        )
        res = self.client.patch(self.detail_url(self.button.pk), {
            'name': 'taken.js',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST, res.data)

    def test_patch_folder_content_returns_400(self):
        self.as_owner()
        res = self.client.patch(self.detail_url(self.src.pk), {
            'content': 'nope',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST, res.data)
        self.assertIn('Folder ka content', str(res.data))

    # Test 8 - dusre repo ka parent
    def test_parent_from_other_repository_rejected(self):
        self.as_owner()
        res = self.client.post(self.tree_url, {
            'name': 'hack.js', 'node_type': 'file', 'parent': self.other_folder.pk,
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST, res.data)
        self.assertIn('Parent folder nahi mila', str(res.data))

    # Test 9 - folder delete -> cascade
    def test_delete_folder_cascades(self):
        self.as_owner()
        res = self.client.delete(self.detail_url(self.src.pk))
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(FileNode.objects.filter(pk=self.src.pk).exists())
        self.assertFalse(FileNode.objects.filter(pk=self.button.pk).exists())

    # Test 10 - bina permission
    def test_write_without_permission_forbidden(self):
        self.client.force_authenticate(user=self.stranger)
        res = self.client.post(self.tree_url, {
            'name': 'x.js', 'node_type': 'file',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN, res.data)

    def test_read_tree_is_open(self):
        res = self.client.get(self.tree_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]['name'], 'src')
        self.assertEqual(len(res.data[0]['children']), 1)

    def test_create_folder_ignores_content(self):
        self.as_owner()
        res = self.client.post(self.tree_url, {
            'name': 'docs', 'node_type': 'folder', 'content': 'ignore me',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.data)
        self.assertIsNone(res.data['content'])
        self.assertEqual(FileNode.objects.get(pk=res.data['id']).content, '')

    def test_node_from_other_repository_is_404(self):
        self.as_owner()
        res = self.client.get(self.detail_url(self.other_folder.pk))
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_patch_content_preserves_whitespace(self):
        self.as_owner()
        code = "def main():\n    return 1\n"
        res = self.client.patch(self.detail_url(self.button.pk), {
            'content': code,
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)
        self.assertEqual(res.data['content'], code)
        self.button.refresh_from_db()
        self.assertEqual(self.button.content, code)

    def test_create_content_preserves_whitespace(self):
        self.as_owner()
        code = "\n\nconst x = 1;\n"
        res = self.client.post(self.tree_url, {
            'name': 'ws.js', 'node_type': 'file', 'content': code,
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.data)
        self.assertEqual(res.data['content'], code)
        self.assertEqual(FileNode.objects.get(pk=res.data['id']).content, code)

    def test_patch_content_to_only_newline(self):
        self.as_owner()
        res = self.client.patch(self.detail_url(self.button.pk), {
            'content': '\n',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)
        self.assertEqual(res.data['content'], '\n')


class PrivateRepositoryFileTests(APITestCase):
    """is_public=False hone pe read kiske liye khula rehta hai."""

    def setUp(self):
        self.owner = User.objects.create_user(
            username='powner', email='powner@example.com', password='pass12345'
        )
        self.member = User.objects.create_user(
            username='pmember', email='pmember@example.com', password='pass12345'
        )
        self.stranger = User.objects.create_user(
            username='pstranger', email='pstranger@example.com', password='pass12345'
        )

        self.org = Organisation.objects.create(name='acme')
        Membership.objects.create(
            organisation=self.org, user=self.owner, role='owner'
        )
        # Plain member - manage rights nahi, sirf dekhne ka haq
        Membership.objects.create(
            organisation=self.org, user=self.member, role='member'
        )

        self.private = Repository.objects.create(
            name='secret-repo', owner=self.owner,
            organization=self.org, is_public=False,
        )
        self.node = FileNode.objects.create(
            repository=self.private, name='keys.env',
            node_type=FileNode.NodeType.FILE, content='TOKEN=abc',
        )

        self.tree_url = f'/api/repositories/{self.private.pk}/tree/'
        self.node_url = f'/api/repositories/{self.private.pk}/files/{self.node.pk}/'

    def test_anonymous_cannot_read_private_tree(self):
        res = self.client.get(self.tree_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED, res.data)

    def test_anonymous_cannot_read_private_file(self):
        res = self.client.get(self.node_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED, res.data)

    def test_stranger_cannot_read_private_tree(self):
        self.client.force_authenticate(user=self.stranger)
        res = self.client.get(self.tree_url)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN, res.data)

    def test_owner_can_read_private_tree(self):
        self.client.force_authenticate(user=self.owner)
        res = self.client.get(self.tree_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)
        self.assertEqual(len(res.data), 1)

    def test_plain_org_member_can_read_but_not_write(self):
        self.client.force_authenticate(user=self.member)

        read = self.client.get(self.node_url)
        self.assertEqual(read.status_code, status.HTTP_200_OK, read.data)
        self.assertEqual(read.data['content'], 'TOKEN=abc')

        write = self.client.post(self.tree_url, {
            'name': 'x.js', 'node_type': 'file',
        }, format='json')
        self.assertEqual(write.status_code, status.HTTP_403_FORBIDDEN, write.data)

    def test_making_repo_public_opens_read(self):
        self.private.is_public = True
        self.private.save(update_fields=['is_public'])
        res = self.client.get(self.tree_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)
