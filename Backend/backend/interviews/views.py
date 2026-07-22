from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
# Create your views here.
from .serializers import InterviewSessionSerializer
from interview_ai.services import generate_questions
from .models import Question
class CreateInterviewView(APIView):
 permission_classes=[IsAuthenticated]
 def post(self,request):
  serializer=InterviewSessionSerializer(data=request.data)
  if(serializer.is_valid()):
    interview=serializer.save(user=request.user)
    questions=generate_questions(
     interview.interview_type,
     interview.experience,
     interview.topic,
     interview.difficulty,
     interview.question_no
    )
    for question in questions:
     Question.objects.create(
      interview=interview,
       question_text = question["question"],
       expected_answer=question["expected_answer"],
       category=question["category"]
    )
    return Response(
    {"message":"Interview created successfully","questions":questions},status=status.HTTP_201_CREATED
   )  
  return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
   
