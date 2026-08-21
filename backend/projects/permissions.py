
from rest_framework.permissions import BasePermission,SAFE_METHODS
from django.shortcuts import get_object_or_404
from repositories.models import Repository
from projects.models import Project, Column




class IsRepoOwnerForProject(BasePermission):
  def has_permission(self, request, view):
    if request.method in SAFE_METHODS:
      return True
    repository=get_object_or_404(Repository,id=view.kwargs["repo_id"])
    return repository.owner==request.user


  def has_object_permission(self, request, view, obj):
    if request.method in SAFE_METHODS:
      return True
    return obj.repository.owner==request.user


class IsRepoOwnerForColumn(BasePermission):
  def has_permission(self,request,view):
    if request.method in SAFE_METHODS:
      return True
    project=get_object_or_404(Project,id=view.kwargs["project_id"])
    return project.repository.owner==request.user
    

  def has_object_permission(self, request, view, obj):
    if request.method in SAFE_METHODS:
      return True
    return obj.project.repository.owner==request.user

class IsRepoOwnerForCard(BasePermission):
  def has_permission(self, request, view):
    if request.method in SAFE_METHODS:
      return True
    column=get_object_or_404(Column,id=view.kwargs["column_id"])
    return column.project.repository.owner==request.user

  def has_object_permission(self, request, view, obj):
    if request.method in SAFE_METHODS:
      return True
    return obj.column.project.repository.owner==request.user
  
    
    
    
    
    
    
