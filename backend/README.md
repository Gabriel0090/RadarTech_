# Backend — Radar Tech

API REST do Radar Tech, construída com FastAPI, SQLAlchemy 2 assíncrono e PostgreSQL.

## 1. Preparar o PostgreSQL (primeira execução)

O backend **não cria o banco nem as tabelas automaticamente**. O schema oficial do projeto está em `../database/radarDatabase.sql`.

Com o serviço PostgreSQL instalado e ativo, crie o banco:

```powershell
createdb -U postgres radar_tech
```

A partir da raiz do repositório, aplique o schema:

```powershell
psql -U postgres -d radar_tech -f .\database\radarDatabase.sql
```

Se o banco já existir, não execute o script novamente sem verificar antes: ele contém comandos `CREATE TABLE` e não é uma migração incremental.

## 2. Configurar e iniciar a API (PowerShell)

Execute os comandos a partir desta pasta (`backend`):

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edite o arquivo `.env` e informe a senha real do PostgreSQL em `DATABASE_URL`. Troque também `JWT_SECRET_KEY` por uma chave aleatória longa. Não compartilhe nem versione o `.env`.

Inicie a API:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

- Documentação interativa: http://127.0.0.1:8000/docs
- Processo ativo: http://127.0.0.1:8000/health
- Conexão com o PostgreSQL: http://127.0.0.1:8000/ready

O endpoint `/health` não testa o banco; use `/ready` para confirmar a conexão.

## 3. Configurar e iniciar o frontend

Na pasta `Frontend/RadarTech`, crie um arquivo `.env` a partir do exemplo:

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

O padrão de `VITE_API_URL` é `http://127.0.0.1:8000`. Se alterar a porta ou endereço do backend, atualize essa variável. O CORS do backend deve incluir a origem exata do Vite (normalmente `http://localhost:5173`); ajuste `FRONTEND_ORIGINS` no `backend/.env` se necessário.

## 4. Autenticação disponível

- `POST /api/v1/auth/register`: cria usuário (nome, e-mail e senha com mínimo de 8 caracteres).
- `POST /api/v1/auth/login`: valida credenciais e retorna JWT.
- `GET /api/v1/auth/me`: retorna o usuário autenticado; exige `Authorization: Bearer <token>`.

As tabelas e os modelos ORM devem permanecer alinhados com `database/radarDatabase.sql`. O diretório Alembic está preparado, mas ainda não há uma migração inicial versionada; mudanças futuras de estrutura devem ser registradas por migrações.
