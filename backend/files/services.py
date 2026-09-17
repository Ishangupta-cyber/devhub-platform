from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction

from .models import FileNode


def get_file_tree(repository):
  nodes=FileNode.objects.filter(repository=repository).defer('content').order_by('-node_type','name')
  node_map={}
  for node in nodes:
    node_map[node.pk]={
      'id':node.pk,
      'name':node.name,
      'node_type':node.node_type,
      'parent':node.parent_id,
      'updated_at':node.updated_at,
      'children':[]
  }

  roots = []
  for node in nodes:
      if node.parent_id is not None:
          parent_dict = node_map.get(node.parent_id)
          if parent_dict is not None:
              parent_dict['children'].append(node_map[node.pk])
      else:
          roots.append(node_map[node.pk])
  return roots

def get_node_details(node):
  return {
      'id': node.pk,
      'name': node.name,
      'node_type': node.node_type,
      'parent': node.parent_id,
      'path': node.get_full_path(),
      'content': node.content if not node.is_folder else None,
      'created_at': node.created_at,
      'updated_at': node.updated_at,
  }


def _validate_unique_name(repository, parent, name, exclude_pk=None):
    """Same parent ke andar same naam allowed nahi."""
    qs = FileNode.objects.filter(repository=repository, parent=parent, name=name)
    if exclude_pk is not None:
        qs = qs.exclude(pk=exclude_pk)
    if qs.exists():
        where = f"'{parent.name}'" if parent else "root"
        raise ValidationError(f"{where} mein '{name}' pehle se maujood hai.")


def _resolve_parent(parent_id, repository):
    """
    parent_id (int ya None) -> FileNode object ya None.
    Saath mein validate bhi karta hai.
    """
    if parent_id is None:
        return None

    try:
        parent = FileNode.objects.get(pk=parent_id, repository=repository)
    except FileNode.DoesNotExist:
        raise ValidationError("Parent folder nahi mila.")

    if not parent.is_folder:
        raise ValidationError("Parent ek folder hona chahiye — file ke andar kuch nahi bana sakte.")

    return parent


def create_file_node(repository, name, node_type, parent=None, content=''):
    _validate_unique_name(repository, parent, name)

    is_folder = node_type == FileNode.NodeType.FOLDER

    try:
        with transaction.atomic():
            return FileNode.objects.create(
                repository=repository,
                parent=parent,
                name=name,
                node_type=node_type,
                content='' if is_folder else content,
            )
    except IntegrityError:
        raise ValidationError(f"'{name}' pehle se maujood hai.")


def update_file_node(node, name=None, content=None):
    changed = []

    if name is not None and name != node.name:
        _validate_unique_name(node.repository, node.parent, name, exclude_pk=node.pk)
        node.name = name
        changed.append('name')

    if content is not None:
        if node.is_folder:
            raise ValidationError("Folder ka content set nahi kar sakte.")
        if content != node.content:
            node.content = content
            changed.append('content')

    if not changed:
        return node

    changed.append('updated_at')
    try:
        with transaction.atomic():
            node.save(update_fields=changed)
    except IntegrityError:
        raise ValidationError(f"'{node.name}' pehle se maujood hai.")

    return node


def delete_file_node(node):
    """Node + saare descendants (CASCADE). Kitne gaye wo return karta hai."""
    total, _ = node.delete()
    return total
