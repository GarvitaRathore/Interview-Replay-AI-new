from django.urls import path
from .views import CreateInterviewView
urlpatterns=[
    path("create/",CreateInterviewView.as_view(),name="create_interview"),
]