from rest_framework import serializers
from admin_panel.models import ActivityLog, SystemSetting
from accounts.serializers import UserSerializer

class ActivityLogSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = ['id', 'user', 'user_email', 'user_name', 'action', 'description', 'ip_address', 'created_at']

    def get_user_email(self, obj):
        return obj.user.email if obj.user else 'System'

    def get_user_name(self, obj):
        return obj.user.full_name if obj.user else 'System'

class SystemSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSetting
        fields = ['id', 'key', 'value', 'description', 'updated_at']
