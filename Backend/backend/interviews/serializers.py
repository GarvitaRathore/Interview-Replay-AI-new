from rest_framework import serializers
from .models import InterviewSession,Question,UserAnswer
class InterviewSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model=InterviewSession
        fields="__all__"
        read_only_fields=["user"]
class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model=Question
        fields=[
            "id",
            "question_order",
            "question_text",
            "category",
        ]
class UserAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model=UserAnswer
        fields=["user_answer","score","feedback"]
class ResultSerializer(serializers.ModelSerializer):
    class Meta:
        model=UserAnswer
        fields="__all__"