from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.
class User(AbstractUser):
    target_role=models.CharField(blank=True,max_length=50)
    github=models.URLField(blank=True)
    linkedin=models.URLField(blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.username