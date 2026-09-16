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

