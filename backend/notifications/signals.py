from django.dispatch import receiver
from django.db.models.signals import post_save
from comments.models import Comments
from .tasks import notify
from issues.models import Issue
from profiles.models import Follow

@receiver(post_save,sender=Comments)
def on_comment(sender,instance,created,**kwargs):
  if created:
    issue=instance.content.object
    if hasattr(issue,'created_by'):
      notify(recipient=issue.created_by,actor=instance.author,verb="commented_on_your_issue",target=issue)

@receiver(post_save,sender=Issue)
def on_issue(sender,instance,created,**kwargs):
  if created:
    notify(recipient=instance.repository.owner,actor=instance.created_by,verb="opened_issue_on_your_repo",target=instance)

@receiver(post_save,sender=Follow)
def on_follow(sender,instance,created,**kwargs):
  if created:
    notify(recipient=instance.following,actor=instance.follower,verb="followed_you",target=instance.follower)


    

