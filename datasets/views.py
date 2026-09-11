import pandas as pd
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from datasets.models import Dataset
from datasets.serializers import DatasetSerializer
from transactions.models import BitcoinTransaction
from accounts.permissions import IsAdminUserRole, IsAdminOrApprovedAnalyst
from accounts.views import log_activity

def process_and_analyze_dataset(dataset, user=None):
    dataset.status = Dataset.Status.PROCESSING
    dataset.save()

    df = pd.read_csv(dataset.file.path)
    transactions_to_create = []
    skipped_rows = 0
    min_date = None
    max_date = None

    for idx, row in df.iterrows():
        try:
            if 'txId1' in df.columns and 'txId2' in df.columns:
                tx_hash = f"ELLIPTIC_TX_{row['txId1']}_{row['txId2']}"
                sender = f"W_ELLIPTIC_{row['txId1']}"
                receiver = f"W_ELLIPTIC_{row['txId2']}"
                amount = float(row.get('amount', 1.0))
            else:
                sender = str(
                    row.get('sender_wallet') or row.get('sender') or row.get('source') or
                    row.get('from_address') or row.get('from') or f"W_SENDER_{idx}"
                ).strip()
                receiver = str(
                    row.get('receiver_wallet') or row.get('receiver') or row.get('target') or
                    row.get('to_address') or row.get('to') or f"W_RECEIVER_{idx}"
                ).strip()
                tx_hash = str(
                    row.get('transaction_hash') or row.get('tx_hash') or row.get('hash') or
                    row.get('txid') or f"TX-{dataset.id}-{idx}"
                ).strip()
                
                amt_raw = row.get('amount') if pd.notna(row.get('amount')) else (row.get('value') if pd.notna(row.get('value')) else 1.0)
                try:
                    amount = float(amt_raw)
                except (ValueError, TypeError):
                    amount = 1.0

            tx_time_raw = row.get('transaction_time') or row.get('time') or row.get('timestamp') or row.get('date')
            if pd.notna(tx_time_raw):
                try:
                    tx_time = pd.to_datetime(tx_time_raw).to_pydatetime()
                except Exception:
                    tx_time = datetime.now()
            else:
                tx_time = datetime.now()

            if min_date is None or tx_time < min_date:
                min_date = tx_time
            if max_date is None or tx_time > max_date:
                max_date = tx_time

            block_height = int(float(row.get('block_height', 0))) if pd.notna(row.get('block_height')) else 0
            fee = float(row.get('fee', 0.0)) if pd.notna(row.get('fee')) else 0.0
            input_count = int(float(row.get('input_count', 1))) if pd.notna(row.get('input_count')) else 1
            output_count = int(float(row.get('output_count', 1))) if pd.notna(row.get('output_count')) else 1

            transactions_to_create.append(BitcoinTransaction(
                transaction_hash=tx_hash,
                sender_wallet=sender,
                receiver_wallet=receiver,
                amount=amount,
                transaction_time=tx_time,
                block_height=block_height,
                fee=fee,
                input_count=input_count,
                output_count=output_count,
                dataset=dataset
            ))
        except Exception:
            skipped_rows += 1
            continue

    if transactions_to_create:
        BitcoinTransaction.objects.bulk_create(transactions_to_create, ignore_conflicts=True)

    dataset.row_count = len(transactions_to_create)
    dataset.date_min = min_date
    dataset.date_max = max_date
    dataset.status = Dataset.Status.IMPORTED
    dataset.save()

    # Trigger automatic full fraud analysis pipeline over the imported dataset
    from fraud_detection.services.fraud_detector import execute_full_fraud_analysis
    from fraud_detection.services.temporal_validator import run_temporal_validation
    from fraud_detection.services.adversarial_detector import run_adversarial_testing

    execute_full_fraud_analysis(dataset_id=dataset.id, user=user)
    execute_full_fraud_analysis(dataset_id=None, user=user)
    run_temporal_validation()
    try:
        run_adversarial_testing(dataset_id=dataset.id)
    except Exception:
        pass

    return {
        "success": True,
        "message": f"Successfully imported and analyzed {len(transactions_to_create)} transactions.",
        "imported_rows": len(transactions_to_create),
        "skipped_rows": skipped_rows,
        "data": DatasetSerializer(dataset).data
    }

class DatasetListCreateView(APIView):
    permission_classes = [IsAdminOrApprovedAnalyst]

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUserRole()]
        return [IsAdminOrApprovedAnalyst()]

    def get(self, request):
        datasets = Dataset.objects.all().order_by('-created_at')
        serializer = DatasetSerializer(datasets, many=True)
        return Response({
            "success": True,
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = DatasetSerializer(data=request.data)
        if serializer.is_valid():
            dataset = serializer.save(uploaded_by=request.user)
            log_activity(request.user, "DATASET_UPLOADED", f"Uploaded dataset: {dataset.name}", request)
            
            # Auto-import and execute analysis upon CSV upload
            if dataset.file and dataset.file.path.endswith('.csv'):
                try:
                    res_data = process_and_analyze_dataset(dataset, request.user)
                    return Response({
                        "success": True,
                        "message": f"Dataset uploaded and analyzed! Imported {res_data['imported_rows']} transactions.",
                        "data": DatasetSerializer(dataset).data
                    }, status=status.HTTP_201_CREATED)
                except Exception as err:
                    print(f"Auto-process error: {err}")

            return Response({
                "success": True,
                "message": "Dataset uploaded successfully",
                "data": DatasetSerializer(dataset).data
            }, status=status.HTTP_201_CREATED)

        return Response({
            "success": False,
            "message": "Upload failed",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class DatasetDetailView(APIView):
    permission_classes = [IsAdminOrApprovedAnalyst]

    def get(self, request, pk):
        dataset = get_object_or_404(Dataset, pk=pk)
        return Response({
            "success": True,
            "data": DatasetSerializer(dataset).data
        }, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        if not (request.user.role == 'ADMIN' or request.user.is_superuser):
            return Response({"success": False, "message": "Only admins can delete datasets"}, status=status.HTTP_403_FORBIDDEN)
        
        dataset = get_object_or_404(Dataset, pk=pk)
        dataset_name = dataset.name
        dataset.delete()
        log_activity(request.user, "DATASET_DELETED", f"Deleted dataset: {dataset_name}", request)
        return Response({
            "success": True,
            "message": "Dataset deleted successfully"
        }, status=status.HTTP_200_OK)

class DatasetImportView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        dataset = get_object_or_404(Dataset, pk=pk)
        if not dataset.file:
            return Response({"success": False, "message": "No file associated with this dataset"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            res_data = process_and_analyze_dataset(dataset, request.user)
            log_activity(request.user, "DATASET_IMPORTED", f"Imported & analyzed dataset {dataset.name}", request)
            return Response(res_data, status=status.HTTP_200_OK)
        except Exception as e:
            dataset.status = Dataset.Status.FAILED
            dataset.save()
            return Response({
                "success": False,
                "message": f"Import failed: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DatasetPreviewView(APIView):
    permission_classes = [IsAdminOrApprovedAnalyst]

    def get(self, request, pk):
        dataset = get_object_or_404(Dataset, pk=pk)
        try:
            if dataset.file and dataset.file.path.endswith('.csv'):
                df = pd.read_csv(dataset.file.path, nrows=20)
                preview_data = df.fillna("").to_dict(orient='records')
            else:
                txs = BitcoinTransaction.objects.filter(dataset=dataset)[:20]
                preview_data = [{
                    "transaction_hash": t.transaction_hash,
                    "sender_wallet": t.sender_wallet,
                    "receiver_wallet": t.receiver_wallet,
                    "amount": float(t.amount),
                    "transaction_time": t.transaction_time.isoformat()
                } for t in txs]

            return Response({
                "success": True,
                "data": {
                    "dataset": DatasetSerializer(dataset).data,
                    "preview": preview_data
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "success": False,
                "message": f"Failed to load preview: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
