
from celery import shared_task
from django.contrib.contenttypes.models import ContentType
from .models import Notification 
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


@shared_task
def send_notification_task(recipient_id,actor_id,verb,content_type_id,object_id):
  notification=Notification.objects.create(recipient_id=recipient_id,actor_id=actor_id,verb=verb,content_type_id=content_type_id,object_id=object_id)

  channel_layer=get_channel_layer()
  async_to_sync(channel_layer.group_send)(
    f"user_{recipient_id}",
    {
      "type":"notify",
      "data":{
        "id":notification.id,
        "actor":notification.actor.username,
        "verb":notification.verb,
        "created_at":str(notification.created_at)
      }
    }
  )


def notify(recipient,actor,verb,target):
  if recipient == actor:
    return 
  
  content_type=ContentType.objects.get_for_model(target)
  send_notification_task.delay(
    recipient_id=recipient.id,
    actor_id=actor.id,
    verb=verb,
    content_type_id=content_type.id,
    object_id=target.id
  )
