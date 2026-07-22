from django.contrib import admin
from .models import InterviewSession,Question,UserAnswer
# Register your models here.
admin.site.register(InterviewSession)
admin.site.register(Question)
admin.site.register(UserAnswer)