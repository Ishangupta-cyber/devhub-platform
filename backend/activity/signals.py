from django.db.models.signals import post_save
from django.dispatch import receiver
from .tasks import log_activity
from profiles.models import Follow
from repositories.models import Repository
from issues.models import Issue


@receiver(post_save,sender=Follow)
def on_follow_created(sender,instance,created,**kwargs):
  if created:
    log_activity(actor=instance.follower,verb="followed",target=instance.following)

@receiver(post_save,sender=Repository)
def on_repository_created(sender,instance,created,**kwargs):
  if created:
    log_activity(actor=instance.owner,verb="created_repository",target=instance)

@receiver(post_save,sender=Issue)
def on_issue_created(sender,instance,created,**kwargs):
  if created:
    log_activity(actor=instance.created_by,verb="created_issue",target=instance)
