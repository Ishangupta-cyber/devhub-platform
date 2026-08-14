from django.urls import path
from .views import ProfileDetailView,FollowersListView,FollowingListView,FollowUserView,UnFollowUserView



urlpatterns = [
    path("<str:username>/",ProfileDetailView.as_view(),name="profile-detail"),
    path("<str:username>/follow/",FollowUserView.as_view(),name="follow-user"),
    path("<str:username>/unfollow/",UnFollowUserView.as_view(),name="unfollow-user"),
    path("<str:username>/followers/",FollowersListView.as_view(),name="followers-list"),
    path("<str:username>/following/",FollowingListView.as_view(),name="following-list"),
]