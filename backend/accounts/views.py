from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.models import User
from accounts.serializers import RegisterSerializer, LoginSerializer, UserSerializer

def log_activity(user, action, description, request=None):
    try:
        from admin_panel.models import ActivityLog
        ip = None
        if request:
            x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded:
                ip = x_forwarded.split(',')[0]
            else:
                ip = request.META.get('REMOTE_ADDR')
        ActivityLog.objects.create(
            user=user if (user and user.is_authenticated) else None,
            action=action,
            description=description,
            ip_address=ip or '127.0.0.1'
        )
    except Exception:
        pass

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            log_activity(user, "ANALYST_REGISTERED", f"Analyst registered: {user.email}", request)
            return Response({
                "success": True,
                "message": "Registration successful. Your account is pending admin approval.",
                "data": UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            "success": False,
            "message": "Registration failed.",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            log_activity(user, "USER_LOGIN", f"User logged in: {user.email}", request)
            
            return Response({
                "success": True,
                "message": "Login successful",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data
            }, status=status.HTTP_200_OK)

        return Response({
            "success": False,
            "message": "Login failed",
            "errors": serializer.errors
        }, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            log_activity(request.user, "USER_LOGOUT", f"User logged out: {request.user.email}", request)
            return Response({
                "success": True,
                "message": "Successfully logged out"
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "success": False,
                "message": "Logout failed or token already invalid",
                "errors": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response({
            "success": True,
            "data": serializer.data
        }, status=status.HTTP_200_OK)
