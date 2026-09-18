# interviews-views.py
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
# Create your views here.
from .serializers import InterviewSessionSerializer,QuestionSerializer,UserAnswerSerializer,ResultSerializer
from interview_ai.services import generate_questions,evaluate_answer,count_filler_words
from .models import Question,InterviewSession,UserAnswer,ProctoringEvent
from rest_framework.parsers import MultiPartParser, FormParser
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
     interview.number_of_questions
    )
    print("GENERATED QUESTIONS:",questions)
    for index,question in enumerate(questions,start=1):
     Question.objects.create(
      interview=interview,
      question_order=index,
       question_text = question["question"],
       expected_answer=question["expected_answer"],
       category=question["category"]
    )
    return Response(
    {"message":"Interview created successfully","interview_id":interview.id,"questions":questions},status=status.HTTP_201_CREATED
   )  
  return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
class InterviewQuestionsView(APIView):
  permission_classes=[IsAuthenticated]
  def get(self,request,interview_id):
   print(request.user.id)
   print(request.user.username)
   interview=InterviewSession.objects.get(
    id=interview_id,
    user=request.user
   )
   questions=Question.objects.filter(
    interview=interview).order_by("question_order")
   serializer=QuestionSerializer(questions,many=True)
   return Response(serializer.data,status=status.HTTP_200_OK)
class SubmitAnswerView(APIView):
 permission_classes=[IsAuthenticated]
 def post(self,request,question_id):
  question=Question.objects.get(id=question_id,interview__user=request.user)
  if question.interview.is_terminated:
      return Response({"error": "This interview has been terminated due to policy violations."}, status=status.HTTP_403_FORBIDDEN)
  serializer=UserAnswerSerializer(data=request.data)
  # print("Request Data : ",request.data)
  if serializer.is_valid():
  #  print(serializer.validated_data)
  # else:
  #  print(serializer.errors)
  #  answer=UserAnswer.objects.create(
  #   question=question,
  #   user_answer=user_answer
  #  )
  #  result=evaluate_answer(
  #   question.question_text,
  #   question.expected_answer,
  #   user_answer
  #  )
   user_answer=serializer.validated_data["user_answer"]
   answer=UserAnswer.objects.create(
    question=question,
    user_answer=user_answer
   )
   interview = question.interview
   answered_count = UserAnswer.objects.filter(question__interview=interview).count()
   if answered_count >= interview.number_of_questions:
    interview.status = "COMPLETED"
   else:
    interview.status = "IN PROGRESS"
   interview.save()
    # "score":result["score"],
    # "feedback":result["feedback"]
    # }
   return Response(UserAnswerSerializer(answer).data,status=status.HTTP_201_CREATED)
  return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
class InterviewResultView(APIView):
 permission_classes=[IsAuthenticated]
 def get(self,request,interview_id):
  interview=InterviewSession.objects.get(id=interview_id, user=request.user)
  answers=UserAnswer.objects.filter(question__interview=interview)
  data=[]
  print("Result API called")
  for answer in answers:
   if answer.score is None:
    print("Calling Gemini...")
    result=evaluate_answer(
     answer.question.question_text,
     answer.question.expected_answer,
     answer.user_answer
    )
    print("User answer:",answer.user_answer)
    fillers=count_filler_words(answer.user_answer)
    print("Fillers found:",fillers)
    answer.score=result["score"]
    answer.feedback=result["feedback"]
    answer.filler_words=fillers
    answer.save()
   data.append({
   "question":answer.question.question_text,
   "expected_answer":answer.question.expected_answer,
   "user_answer":answer.user_answer,
   "score":answer.score,
   "feedback":answer.feedback,
   "filler_words":answer.filler_words
  })
  overall=(
   sum(answer.score for answer in answers)/len(answers)
           if answers
           else 0
  )
  overall=round(overall,2);
  return Response(
  {"overall_score":overall,
   "total_questions":len(answers),
   "results":data},
   status=status.HTTP_200_OK)
# interviews/views.py
class ReportViolationView(APIView):
    permission_classes = [IsAuthenticated]
    WARN_THRESHOLD = 1
    TERMINATE_THRESHOLD = 6

    def post(self, request, interview_id):
        interview = InterviewSession.objects.get(id=interview_id, user=request.user)
        if interview.is_terminated:
            return Response({"status": "already_terminated"}, status=status.HTTP_403_FORBIDDEN)

        event_type = request.data.get("event_type")
        ProctoringEvent.objects.create(
            interview=interview, event_type=event_type, meta=request.data.get("meta", {})
        )
        interview.warning_count += 1

        if interview.warning_count >= self.TERMINATE_THRESHOLD:
            interview.is_terminated = True
            interview.termination_reason = event_type
            interview.status = "COMPLETED"
            interview.save()
            return Response({"status": "terminated", "count": interview.warning_count})

        interview.save()
        action = "warn" if interview.warning_count >= self.WARN_THRESHOLD else "log"
        return Response({"status": action, "count": interview.warning_count})
class UploadReferencePhotoView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, interview_id):
        interview = InterviewSession.objects.get(id=interview_id, user=request.user)
        photo = request.FILES.get("photo")
        if not photo:
            return Response({"error": "No photo provided"}, status=status.HTTP_400_BAD_REQUEST)

        interview.reference_photo = photo
        interview.save()
        return Response(
            {"message": "Reference photo saved", "photo_url": interview.reference_photo.url},
            status=status.HTTP_201_CREATED,
        )
# class ResultView(APIView):
#  permission_classes=[IsAuthenticated]
#  def get(self,request,question_id):
#   result=UserAnswer.objects.get(question_id=question_id,
#                                 question__interview__user=request.user)
#   serializer=ResultSerializer(result)
#   return Response(serializer.data)