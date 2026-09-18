from django.urls import path
from .views import CreateInterviewView,InterviewQuestionsView,SubmitAnswerView,InterviewResultView,ReportViolationView,UploadReferencePhotoView
urlpatterns=[
    path("create/",CreateInterviewView.as_view(),name="create"),
    path("questions/<int:interview_id>/",InterviewQuestionsView.as_view(),name="questions"),
    path("submit/<int:question_id>/",SubmitAnswerView.as_view(),name="submit_answer"),
    path("results/<int:interview_id>/",InterviewResultView.as_view(),name="results"),
    path("violation/<int:interview_id>/", ReportViolationView.as_view(), name="violation"),
    path("upload-photo/<int:interview_id>/", UploadReferencePhotoView.as_view(), name="upload-photo"),
]