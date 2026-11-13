from rest_framework import permissions


class IsRepositoryOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.repository.user_can_manage(request.user)


class IsAuthorOrRepositoryManager(permissions.BasePermission):
    """Edits allowed for whoever created the object, or a repo manager."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.created_by_id == request.user.id or obj.repository.user_can_manage(request.user)
