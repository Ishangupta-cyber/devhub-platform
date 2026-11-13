from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from rest_framework.test import APITestCase

from profiles.models import Follow
from repositories.models import Repository
from .models import Activity

User = get_user_model()


class ActivityFeedPrivacyTests(APITestCase):

    def test_feed_hides_activity_from_private_repos_viewer_cannot_see(self):
        dev = User.objects.create_user(username='dev', email='d@x.com', password='pass12345')
        fan = User.objects.create_user(username='fan', email='f@x.com', password='pass12345')
        Follow.objects.create(follower=fan, following=dev)
        ct = ContentType.objects.get_for_model(Repository)
        public = Repository.objects.create(name='pub', owner=dev, is_public=True)
        private = Repository.objects.create(name='priv', owner=dev, is_public=False)
        for repo in (public, private):
            Activity.objects.create(actor=dev, verb='created_repository', content_type=ct, object_id=repo.id)

        self.client.force_authenticate(fan)
        shown = [a['target_display'] for a in self.client.get('/api/activity/feed/').data]
        self.assertEqual(shown, ['pub'])
