from django.db import models
from repositories.models import Repository
from django.db.models import Q

class FileNode(models.Model):

  class NodeType(models.TextChoices):
    FILE='file','File'
    FOLDER='folder','Folder'
    
  repository=models.ForeignKey(to= Repository,on_delete=models.CASCADE,related_name="file_nodes")
  parent=models.ForeignKey("self",related_name="children",on_delete=models.CASCADE,null=True,blank=True)
  name=models.CharField(max_length=255)
  node_type=models.CharField(max_length=10,choices=NodeType.choices,default=NodeType.FILE)
  content=models.TextField(blank=True,default='')
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  class Meta:

    ordering=["-node_type","name"]
    indexes = [
          models.Index(fields=['repository', 'parent']),
      ]
    constraints = [
          models.UniqueConstraint(
              fields=['repository', 'parent', 'name'],
              condition=Q(parent__isnull=False),
              name='unique_node_name_in_folder',
          ),
          models.UniqueConstraint(
              fields=['repository', 'name'],
              condition=Q(parent__isnull=True),
              name='unique_node_name_at_root',
          ),
      ]
  def __str__(self):
        return f"{self.repository.name}/{self.get_full_path()}"

  @property
  def is_folder(self):
      return self.node_type == self.NodeType.FOLDER


  def get_full_path(self):
        parts = [self.name]
        current = self.parent
        while current is not None:
            parts.append(current.name)
            current = current.parent
        return '/'.join(reversed(parts))