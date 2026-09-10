import os
import shutil
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

if os.getenv('VERCEL') and (PROJECT_ROOT / 'db.sqlite3').exists():
	runtime_database = Path('/tmp/ringfinder.sqlite3')
	if not runtime_database.exists():
		shutil.copy2(PROJECT_ROOT / 'db.sqlite3', runtime_database)
	os.environ['SQLITE_PATH'] = str(runtime_database)

from django.core.wsgi import get_wsgi_application

app = get_wsgi_application()
handler = app