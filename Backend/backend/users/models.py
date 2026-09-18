import random
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta
# Create your models here.
class User(AbstractUser):
    target_role=models.CharField(blank=True,max_length=50)
    github=models.URLField(blank=True)
    linkedin=models.URLField(blank=True)
    is_verified=models.BooleanField(default=False)
    otp_code=models.CharField(max_length=6, blank=True, null=True)
    otp_expires_at=models.DateTimeField(blank=True, null=True)
    created_at=models.DateTimeField(auto_now_add=True)
    def generate_otp(self):
        self.otp_code = f"{random.randint(100000, 999999)}"
        self.otp_expires_at = timezone.now() + timedelta(minutes=10)
        self.save()
        return self.otp_code

    def is_otp_valid(self, code):
        return (
            self.otp_code == code
            and self.otp_expires_at is not None
            and timezone.now() <= self.otp_expires_at
        )

    def __str__(self):
        return self.username