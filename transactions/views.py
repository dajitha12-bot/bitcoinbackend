from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination
from transactions.models import BitcoinTransaction
from fraud_detection.models import FraudResult
from transactions.serializers import BitcoinTransactionSerializer
from accounts.permissions import IsAdminOrApprovedAnalyst, IsAdminUserRole
from accounts.views import log_activity

class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 500

class TransactionListView(APIView):
    permission_classes = [IsAdminOrApprovedAnalyst]

    def get(self, request):
        queryset = BitcoinTransaction.objects.all().order_by('-transaction_time')

        # Filters
        wallet = request.query_params.get('wallet')
        if wallet:
            queryset = queryset.filter(Q(sender_wallet__icontains=wallet) | Q(receiver_wallet__icontains=wallet))

        tx_hash = request.query_params.get('transaction_hash') or request.query_params.get('hash')
        if tx_hash:
            queryset = queryset.filter(transaction_hash__icontains=tx_hash)

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(transaction_hash__icontains=search) |
                Q(sender_wallet__icontains=search) |
                Q(receiver_wallet__icontains=search)
            )

        risk_level = request.query_params.get('risk_level')
        if risk_level:
            risky_wallets = FraudResult.objects.filter(
                risk_level__iexact=risk_level
            ).values('wallet_address')
            queryset = queryset.filter(
                Q(sender_wallet__in=risky_wallets) |
                Q(receiver_wallet__in=risky_wallets)
            )

        min_amount = request.query_params.get('min_amount')
        if min_amount:
            try:
                queryset = queryset.filter(amount__gte=float(min_amount))
            except ValueError:
                pass

        max_amount = request.query_params.get('max_amount')
        if max_amount:
            try:
                queryset = queryset.filter(amount__lte=float(max_amount))
            except ValueError:
                pass

        start_date = request.query_params.get('start_date')
        if start_date:
            queryset = queryset.filter(transaction_time__gte=start_date)

        end_date = request.query_params.get('end_date')
        if end_date:
            queryset = queryset.filter(transaction_time__lte=end_date)

        paginator = StandardPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = BitcoinTransactionSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

class TransactionDetailView(APIView):
    permission_classes = [IsAdminOrApprovedAnalyst]

    def get(self, request, pk):
        tx = get_object_or_404(BitcoinTransaction, pk=pk)
        return Response({
            "success": True,
            "data": BitcoinTransactionSerializer(tx).data
        }, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        if not (request.user.role == 'ADMIN' or request.user.is_superuser):
            return Response({"success": False, "message": "Only admins can delete transactions"}, status=status.HTTP_403_FORBIDDEN)
        
        tx = get_object_or_404(BitcoinTransaction, pk=pk)
        tx_hash = tx.transaction_hash
        tx.delete()
        log_activity(request.user, "TRANSACTION_DELETED", f"Deleted transaction: {tx_hash}", request)
        return Response({
            "success": True,
            "message": "Transaction deleted successfully"
        }, status=status.HTTP_200_OK)
