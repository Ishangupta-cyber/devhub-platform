from django.urls import path
from .views import RepositoryListCreateView, RepositoryDetailView
from issues.views import IssueCreateView,IssueDetailView
from pull_requests.views import PullRequestDetailView,PullRequestListCreateView
from projects.views import ProjectListCreateView

urlpatterns = [
    path('', RepositoryListCreateView.as_view(), name='repository-list-create'),
    path('<int:pk>/', RepositoryDetailView.as_view(), name='repository-detail'),
    path('<int:repo_id>/issues/', IssueCreateView.as_view(), name='issue-list-create'),
    path('<int:repo_id>/issues/<int:pk>/', IssueDetailView.as_view(), name='issue-detail'),
    path('<int:repo_id>/pull-requests/', PullRequestListCreateView.as_view(), name='pr-list-create'),
    path('<int:repo_id>/pull-requests/<int:pk>/', PullRequestDetailView.as_view(), name='pr-detail'),
]

urlpatterns += [
    path('<int:repo_id>/projects/', ProjectListCreateView.as_view(), name='project-list-create'),
]