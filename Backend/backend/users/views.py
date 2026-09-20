# users-views.py
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer,LoginSerializer
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny
from django.core.mail import send_mail
from django.conf import settings
from .models import User
import resend
from decouple import config
def send_otp_email(user, otp):
    resend.api_key = config("RESEND_API_KEY")
    resend.Emails.send({
        "from": "Interview Replay AI <onboarding@resend.dev>",  # Resend's default sender for free tier testing
        "to": user.email,
        "subject": "Your Interview Replay AI verification code",
        "text": f"Hi {user.username},\n\nYour verification code is: {otp}\n\nThis code expires in 10 minutes.",
    })


class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            otp = user.generate_otp()
            try:
                send_otp_email(user, otp)
            except Exception as e:
                print("OTP email failed to send:", e)
            return Response(
                {"message": "Registered. Check your email for a verification code.", "username": user.username},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(
                username=serializer.validated_data["username"],
                password=serializer.validated_data["password"],
            )
            if user is not None:
                if not user.is_verified:
                    return Response(
                        {"error": "Please verify your email before logging in."},
                        status=status.HTTP_403_FORBIDDEN
                    )
                refresh = RefreshToken.for_user(user)
                return Response(
                    {"refresh": str(refresh), "access": str(refresh.access_token)},
                    status=status.HTTP_200_OK
                )
            return Response({"error": "Invalid username or password"}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get("username")
        otp = request.data.get("otp")

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "No account with that username"}, status=status.HTTP_404_NOT_FOUND)

        if user.is_verified:
            return Response({"message": "Already verified"}, status=status.HTTP_200_OK)

        if not user.is_otp_valid(otp):
            return Response({"error": "Invalid or expired code"}, status=status.HTTP_400_BAD_REQUEST)

        user.is_verified = True
        user.otp_code = None
        user.otp_expires_at = None
        user.save()

        refresh = RefreshToken.for_user(user)
        return Response(
            {"message": "Email verified", "refresh": str(refresh), "access": str(refresh.access_token)},
            status=status.HTTP_200_OK
        )


class ResendOTPView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get("username")
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "No account with that username"}, status=status.HTTP_404_NOT_FOUND)

        if user.is_verified:
            return Response({"message": "Already verified"}, status=status.HTTP_200_OK)

        otp = user.generate_otp()
        try:
            send_otp_email(user, otp)
        except Exception as e:
            print("OTP email failed to send:", e)
        return Response({"message": "New code sent"}, status=status.HTTP_200_OK)