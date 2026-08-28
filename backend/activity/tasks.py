from celery import shared_task
from .models import Activity
from django.contrib.contenttypes.models import  ContentType

@shared_task
def create_activity_task(actor_id,verb,content_type_id,object_id):
  Activity.objects.create(actor_id=actor_id,verb=verb,content_type_id=content_type_id,object_id=object_id)


def log_activity(actor,verb,target):
  content_type=ContentType.objects.get_for_model(target)
  create_activity_task.delay(
    actor_id=actor.id,
    verb=verb,
    content_type_id=content_type.id,
    object_id=target.id
  ) 