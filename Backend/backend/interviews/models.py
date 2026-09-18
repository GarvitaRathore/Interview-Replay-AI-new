from django.db import models
from django.conf import settings
# Create your models here.
class InterviewSession(models.Model):
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="interviews")
    interview_types=[
        ("HR","HR"),
        ("TECHNICAL","Technical"),
        ("MIXED","Mixed"),
    ]
    experience_levels=[
        ("FRESHER","Fresher"),
        ("LOW","Low(1-2 Years)"),
        ("MID","Mid(3-5 Years)"),
        ("HIGH","High(6-10 Years)"),
    ]
    difficulty_levels=[
        ("EASY","Easy"),
        ("MEDIUM","Medium"),
        ("HARD","Hard"),
    ]
    status_types=[
        ("PENDING","Pending"),
        ("IN PROGRESS","In progress"),
        ("COMPLETED","Completed"),
    ]
    interview_type=models.CharField(max_length=20,choices=interview_types)
    experience=models.CharField(max_length=20,choices=experience_levels)
    difficulty=models.CharField(max_length=20,choices=difficulty_levels)
    status=models.CharField(max_length=20,choices=status_types,default="PENDING")
    topic=models.CharField(max_length=100,blank=True)
    number_of_questions=models.PositiveIntegerField()
    reference_photo = models.ImageField(upload_to="reference_photos/", null=True, blank=True)
    is_terminated = models.BooleanField(default=False)
    termination_reason = models.CharField(max_length=100, blank=True)
    warning_count = models.PositiveIntegerField(default=0)
    created_at=models.DateField(auto_now_add=True)
class Question(models.Model):
    interview=models.ForeignKey(InterviewSession,on_delete=models.CASCADE,related_name="questions")
    question_order=models.PositiveIntegerField()
    question_text=models.TextField()
    expected_answer=models.TextField()
    category=models.CharField(max_length=50)
    def __str__(self):
        return f"Question {self.question_order}"
class UserAnswer(models.Model):
    question=models.OneToOneField(Question,on_delete=models.CASCADE,related_name="answer")
    user_answer=models.TextField(blank=True)
    score=models.PositiveIntegerField(blank=True,null=True)
    feedback=models.TextField(blank=True,default="")
    duration=models.FloatField(null=True,blank=True)
    words_per_minute=models.FloatField(null=True,blank=True)
    filler_words=models.PositiveIntegerField(default=0)
    created_at=models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"Answer to the Question {self.question.question_order}"
class ProctoringEvent(models.Model):
    EVENT_TYPES = [
        ("TAB_SWITCH", "Tab Switch"),
        ("NO_FACE", "No Face Detected"),
        ("MULTIPLE_FACES", "Multiple Faces Detected"),
        ("DEVICE_DETECTED", "Electronic Device Detected"),
        ("FACE_MISMATCH", "Face Mismatch"),
        ("FULLSCREEN_EXIT", "Exited Fullscreen"),
        ("LOW_GAZE", "Looking Away"),
    ]
    interview = models.ForeignKey(InterviewSession, on_delete=models.CASCADE, related_name="events")
    event_type = models.CharField(max_length=30, choices=EVENT_TYPES)
    meta = models.JSONField(blank=True, default=dict)
    created_at = models.DateTimeField(auto_now_add=True)