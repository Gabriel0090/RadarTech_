# Backend — Radar Tech

API REST do Radar Tech, construída com FastAPI, SQLAlchemy 2 assíncrono e PostgreSQL.

## Ambiente local (PowerShell)

Execute os comandos a partir desta pasta (`backend`):

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edite `.env` com os dados do PostgreSQL. Para iniciar a API:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

A documentação interativa fica em `http://127.0.0.1:8000/docs`; a verificação de disponibilidade fica em `/health`.

O schema e os modelos espelham o SQL existente em `database/radarDatabase.sql`. As tabelas não são criadas automaticamente pela aplicação; alterações de estrutura devem ser controladas pelo Alembic.
