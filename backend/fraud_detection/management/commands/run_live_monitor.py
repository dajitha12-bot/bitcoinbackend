import time

from django.core.management.base import BaseCommand

from fraud_detection.services.fraud_detector import execute_full_fraud_analysis
from fraud_detection.services.mempool_service import fetch_live_mempool_transactions


class Command(BaseCommand):
    help = 'Continuously fetch and analyze live Mempool.space transactions.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--interval',
            type=int,
            default=60,
            help='Seconds between fetch and analysis cycles (default: 60).',
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=20,
            help='Maximum recent transactions to fetch per cycle (default: 20).',
        )
        parser.add_argument(
            '--once',
            action='store_true',
            help='Run one fetch and analysis cycle, then exit.',
        )

    def run_cycle(self, limit):
        fetch_result = fetch_live_mempool_transactions(limit=limit)
        if not fetch_result.get('success'):
            self.stderr.write(f"Live fetch failed: {fetch_result.get('message', 'Unknown error')}")
            return

        analysis_result = execute_full_fraud_analysis()
        self.stdout.write(
            self.style.SUCCESS(
                f"Fetched {fetch_result.get('count', 0)} transactions; "
                f"analyzed {analysis_result.get('total_transactions', 0)}; "
                f"flagged {analysis_result.get('suspicious_transactions', 0)} suspicious."
            )
        )

    def handle(self, *args, **options):
        interval = max(1, options['interval'])
        limit = max(1, options['limit'])

        self.stdout.write(
            f'Live monitor started: fetching every {interval} seconds '
            f'with a limit of {limit}.'
        )

        while True:
            try:
                self.run_cycle(limit)
            except KeyboardInterrupt:
                self.stdout.write('\nLive monitor stopped.')
                return
            except Exception as error:
                self.stderr.write(f'Live monitor cycle failed: {error}')

            if options['once']:
                return

            time.sleep(interval)
