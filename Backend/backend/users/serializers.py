from rest_framework import serializers
from .models import User
class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=[
            "username",
            "email",
            "password",
            "target_role",
            "github",
            "linkedin",
        ]
    extra_kwargs={
        "password":
        {"write_only":True}
    }
    def create(self,validated_data):
        user=User.objects.create_user(

            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            target_role=validated_data["target_role"],
            github=validated_data["github"],
            linkedin=validated_data["linkedin"],

        )  
        return user;
class LoginSerializer(serializers.Serializer):
    username=serializers.CharField()
    password=serializers.CharField(write_only=True)