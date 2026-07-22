from rest_framework import serializers
from .models import InterviewSession,Question,UserAnswer
class InterviewSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model=InterviewSession,
        fields="__all__"