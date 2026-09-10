from rest_framework import serializers
from django.contrib.auth import authenticate
from accounts.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'full_name', 'email', 'phone', 'organization',
            'reason', 'role', 'status', 'created_at', 'approved_at'
        ]
        read_only_fields = ['id', 'role', 'status', 'created_at', 'approved_at']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['full_name', 'email', 'password', 'phone', 'organization', 'reason']

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data['full_name'],
            phone=validated_data.get('phone', ''),
            organization=validated_data.get('organization', ''),
            reason=validated_data.get('reason', ''),
            role=User.Role.FRAUD_ANALYST,
            status=User.Status.PENDING
        )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        user = authenticate(username=email, password=password)
        if not user:
            # Fallback check if user exists
            try:
                existing_user = User.objects.get(email=email)
                if not existing_user.check_password(password):
                    raise serializers.ValidationError("Invalid email or password.")
                user = existing_user
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid email or password.")

        if user.role != User.Role.ADMIN and not user.is_superuser:
            if user.status == User.Status.PENDING:
                raise serializers.ValidationError("Your account registration is currently pending admin approval.")
            elif user.status == User.Status.REJECTED:
                raise serializers.ValidationError("Your account registration request has been rejected by an administrator.")
            elif user.status == User.Status.INACTIVE:
                raise serializers.ValidationError("Your account is currently inactive. Please contact system admin.")

        data['user'] = user
        return data
