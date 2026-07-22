from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer,LoginSerializer
from django.contrib.auth import authenticate
# Create your views here.
class RegisterView(APIView):
     def post(self,request):
      serializer=RegisterSerializer(data=request.data)
      if(serializer.is_valid()):
        user=serializer.save()
        return Response(
        {"message":"User Registered Successfully"},status=status.HTTP_201_CREATED  )  
      return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
class LoginView(APIView):
     def post(self,request):
      serializer=LoginSerializer(data=request.data)
      if(serializer.is_valid()):
        user = authenticate(
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
         )
        if user is not None:
      
         return Response(
            {"message":"Login Successfully"},status=status.HTTP_200_OK)
        return Response({"error":"Invalid username or password" },status=status.HTTP_401_UNAUTHORIZED)
      return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)   

    