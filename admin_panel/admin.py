from django.contrib import admin
from admin_panel.models import ActivityLog, SystemSetting

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'action', 'ip_address', 'created_at')
    search_fields = ('action', 'description', 'ip_address')
    list_filter = ('action', 'created_at')

@admin.register(SystemSetting)
class SystemSettingAdmin(admin.ModelAdmin):
    list_display = ('id', 'key', 'updated_at')
    search_fields = ('key', 'description')
