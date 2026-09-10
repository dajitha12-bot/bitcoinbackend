# RingFinder Windows Quick Start

## Backend

Open PowerShell 1:

```powershell
cd C:\Users\91812\Downloads\ringfinder\backend
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo_data
python manage.py runserver 8000
```

Keep this terminal open.

## Frontend

Open PowerShell 2:

```powershell
cd C:\Users\91812\Downloads\ringfinder\frontend
npm install
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:3001/`.

## Demo accounts

```text
Admin:   admin@ringfinder.com / admin123
Analyst: analyst@ringfinder.com / analyst123
```

## Verification

Open PowerShell 3:

```powershell
cd C:\Users\91812\Downloads\ringfinder\backend
python manage.py check
python manage.py test
```

For the reliable offline demo, use CSV upload, import the dataset, and run fraud detection. The optional live monitor is:

```powershell
python manage.py run_live_monitor --interval 60 --limit 20
```

The monitor requires network access to Mempool.space.