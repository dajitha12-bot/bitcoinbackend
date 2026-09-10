from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination

from accounts.models import User
from accounts.serializers import UserSerializer
from accounts.permissions import IsAdminUserRole
from transactions.models import BitcoinTransaction
from fraud_detection.models import WalletRisk, FraudRing, FraudResult, TemporalValidationResult, AdversarialTestResult
from fraud_detection.serializers import (
    FraudResultSerializer, FraudRingSerializer, TemporalValidationResultSerializer, AdversarialTestResultSerializer
)
from admin_panel.models import ActivityLog, SystemSetting
from admin_panel.serializers import ActivityLogSerializer, SystemSettingSerializer
from accounts.views import log_activity

class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'

class AdminDashboardView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        total_users = User.objects.count()
        pending_analysts = User.objects.filter(role=User.Role.FRAUD_ANALYST, status=User.Status.PENDING).count()
        active_analysts = User.objects.filter(role=User.Role.FRAUD_ANALYST, status__in=[User.Status.APPROVED, User.Status.ACTIVE]).count()

        total_transactions = BitcoinTransaction.objects.count()
        
        # Calculate distinct wallets
        senders = BitcoinTransaction.objects.values_list('sender_wallet', flat=True).distinct()
        receivers = BitcoinTransaction.objects.values_list('receiver_wallet', flat=True).distinct()
        total_wallets = len(set(senders).union(set(receivers)))

        suspicious_txs = FraudResult.objects.filter(prediction='SUSPICIOUS').count()
        high_risk_wallets = WalletRisk.objects.filter(risk_level__in=['HIGH', 'CRITICAL']).count()
        fraud_rings = FraudRing.objects.count()

        return Response({
            "total_users": total_users,
            "pending_analysts": pending_analysts,
            "total_transactions": total_transactions,
            "total_wallets": total_wallets or WalletRisk.objects.count(),
            "suspicious_transactions": suspicious_txs,
            "high_risk_wallets": high_risk_wallets,
            "fraud_rings": fraud_rings,
            "active_analysts": active_analysts
        }, status=status.HTTP_200_OK)

class PendingAnalystsView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        pending = User.objects.filter(role=User.Role.FRAUD_ANALYST, status=User.Status.PENDING).order_by('-created_at')
        serializer = UserSerializer(pending, many=True)
        return Response({
            "success": True,
            "data": serializer.data
        }, status=status.HTTP_200_OK)

class ApproveAnalystView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        analyst = get_object_or_404(User, pk=pk, role=User.Role.FRAUD_ANALYST)
        analyst.status = User.Status.APPROVED
        analyst.approved_at = timezone.now()
        analyst.approved_by = request.user
        analyst.save()

        log_activity(request.user, "ANALYST_APPROVED", f"Approved analyst: {analyst.email}", request)

        return Response({
            "message": "Analyst approved successfully",
            "analyst": {
                "id": analyst.id,
                "status": analyst.status
            }
        }, status=status.HTTP_200_OK)

class RejectAnalystView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        analyst = get_object_or_404(User, pk=pk, role=User.Role.FRAUD_ANALYST)
        analyst.status = User.Status.REJECTED
        analyst.save()

        log_activity(request.user, "ANALYST_REJECTED", f"Rejected analyst: {analyst.email}", request)

        return Response({
            "message": "Analyst rejected successfully",
            "analyst": {
                "id": analyst.id,
                "status": analyst.status
            }
        }, status=status.HTTP_200_OK)

class AnalystListView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        analysts = User.objects.filter(role=User.Role.FRAUD_ANALYST).order_by('-created_at')
        serializer = UserSerializer(analysts, many=True)
        return Response({
            "success": True,
            "data": serializer.data
        }, status=status.HTTP_200_OK)

class AnalystDetailView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request, pk):
        analyst = get_object_or_404(User, pk=pk)
        return Response({
            "success": True,
            "data": UserSerializer(analyst).data
        }, status=status.HTTP_200_OK)

class ActivateAnalystView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        analyst = get_object_or_404(User, pk=pk)
        analyst.status = User.Status.ACTIVE
        analyst.save()
        log_activity(request.user, "ANALYST_ACTIVATED", f"Activated analyst: {analyst.email}", request)
        return Response({"success": True, "message": "Analyst activated successfully", "data": UserSerializer(analyst).data}, status=status.HTTP_200_OK)

class DeactivateAnalystView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        analyst = get_object_or_404(User, pk=pk)
        analyst.status = User.Status.INACTIVE
        analyst.save()
        log_activity(request.user, "ANALYST_DEACTIVATED", f"Deactivated analyst: {analyst.email}", request)
        return Response({"success": True, "message": "Analyst deactivated successfully", "data": UserSerializer(analyst).data}, status=status.HTTP_200_OK)

class AdminFraudResultsView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        results = FraudResult.objects.all().order_by('-analyzed_at')
        paginator = StandardPagination()
        page = paginator.paginate_queryset(results, request)
        serializer = FraudResultSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

class AdminFraudRingsView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        rings = FraudRing.objects.all().order_by('-risk_score')
        serializer = FraudRingSerializer(rings, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)

class AdminTemporalResultsView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        res = TemporalValidationResult.objects.all().order_by('-created_at')
        serializer = TemporalValidationResultSerializer(res, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)

class AdminAdversarialResultsView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        res = AdversarialTestResult.objects.all().order_by('-created_at')
        serializer = AdversarialTestResultSerializer(res, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)

class ActivityLogsView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        logs = ActivityLog.objects.all().order_by('-created_at')
        paginator = StandardPagination()
        page = paginator.paginate_queryset(logs, request)
        serializer = ActivityLogSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

class SystemSettingsView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        settings_qs = SystemSetting.objects.all()
        if not settings_qs.exists():
            default_setting, _ = SystemSetting.objects.get_or_create(
                key="global_config",
                defaults={
                    "value": {
                        "risk_threshold_high": 60,
                        "risk_threshold_critical": 80,
                        "min_cycle_length": 3,
                        "rapid_transfer_seconds": 600,
                        "suspicious_amount_btc": 10.0
                    },
                    "description": "Global fraud engine thresholds"
                }
            )
            settings_qs = [default_setting]

        serializer = SystemSettingSerializer(settings_qs, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)

    def put(self, request):
        key = request.data.get('key', 'global_config')
        val = request.data.get('value', {})
        setting, _ = SystemSetting.objects.get_or_create(key=key)
        setting.value = val
        if 'description' in request.data:
            setting.description = request.data['description']
        setting.save()

        log_activity(request.user, "SYSTEM_SETTINGS_UPDATED", f"Updated system setting {key}", request)
        return Response({"success": True, "message": "System settings updated successfully", "data": SystemSettingSerializer(setting).data}, status=status.HTTP_200_OK)
