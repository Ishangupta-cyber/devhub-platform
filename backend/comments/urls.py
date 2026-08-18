from django.urls import path
from comments.views import CommentListCreateView, CommentDetailView

urlpatterns = [
    path('<int:issue_id>/comments/', CommentListCreateView.as_view(), name='issue-comment-list-create'),
    path('<int:issue_id>/comments/<int:pk>/', CommentDetailView.as_view(), name='issue-comment-detail'),
]