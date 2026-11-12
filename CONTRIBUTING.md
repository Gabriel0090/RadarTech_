# Como contribuir com o RadarTech

Este projeto é desenvolvido em equipe para aprender frontend, backend, APIs REST,
modelagem e consulta de dados, Docker e Git. A arquitetura está no [README](README.md).

## Organização do trabalho

Use o Kanban da equipe para registrar o objetivo, os critérios de aceite e a pessoa
responsável por cada tarefa. Mova o cartão conforme o trabalho avança: a fazer,
em andamento, em revisão e concluído. Vincule o PR ao cartão quando disponível.

Prefira tarefas pequenas e explique as decisões no PR. Quem está aprendendo deve
conseguir reproduzir a execução e compreender por que o código foi alterado.

## Branches, commits e pull requests

A branch `dev` integra o trabalho da equipe. Crie uma feature a partir dela:

```powershell
git status
git fetch origin
git switch dev
git pull --ff-only origin dev
git switch -c feature/seu-nome-descricao
```

Comece com a árvore limpa. Preserve alterações preexistentes; não use stash
automático, `reset --hard` ou force push para resolver divergências. Se a branch
já existir, confira seu histórico antes de reutilizá-la.

Antes de enviar, revise o diff, execute as verificações relacionadas à mudança e
confirme que `.env`, credenciais, arquivos locais e ambientes virtuais não entram
no commit. Prefira selecionar os arquivos explicitamente:

```powershell
git diff
git diff --check
git add caminho/do/arquivo
git diff --cached
git commit -m "feat(backend): descreve a funcionalidade"
git push -u origin feature/seu-nome-descricao
```

Use commits semânticos: `feat` para funcionalidades, `fix` para correções, `docs`
para documentação, `test` para testes, `refactor` para reorganização sem mudança
de comportamento e `chore` para manutenção e infraestrutura. O escopo é opcional.

Abra um PR da feature para `dev`. Descreva o problema, o resultado, as decisões
relevantes e os testes executados, incluindo limitações reais. Peça revisão da
equipe e resolva os comentários e checks existentes antes do merge. Não contorne
proteções da branch. Use merge commit para preservar os commits da feature no
fluxo de integração. Depois, atualize sua `dev` com `git pull --ff-only origin dev`.
Merges em `main` ficam para uma etapa de entrega acordada separadamente.

## Convenções de implementação

- Backend em Python com FastAPI, SQLAlchemy 2.0 assíncrono e Pydantic.
- Tabelas no singular, nomes em snake_case sem acentos e `id_user` preservado.
- IDs BIGINT, datas com timezone e valores monetários com Decimal/NUMERIC(12,2).
- Uma AsyncSession por requisição. Confirme escritas explicitamente com commit.
- Evite consultas implícitas nos relacionamentos: use `selectinload` quando necessário.
- Grave associações de assuntos por `EventoAssunto`; os atalhos N:M são de leitura.
- Toda alteração de esquema deve ter migration Alembic revisada. Não use `create_all()`
  nem execute o SQL de referência como inicializador do Docker.
- Não altere nulabilidade, perfis ou regras de exclusão sem discutir e documentar.
- Adicione testes que verifiquem comportamentos e regras relevantes à alteração.
- Atualize a documentação quando a arquitetura ou o modo de executar mudar.

Sugestões futuras devem exigir login e vincular o autor autenticado; consultas
públicas devem mostrar apenas publicações aprovadas. Autenticação, CRUD, frontend
e integração externa pertencem a tarefas posteriores. Não implemente pagamentos,
inscrição própria ou o recurso de resumo por e-mail nesta etapa.

## Preparar e executar

Requer Docker Desktop iniciado, usando containers Linux, e Docker Compose v2.
Execute na raiz deste repositório (PowerShell):

```powershell
Copy-Item .env.example .env
docker compose config --quiet
docker compose build
docker compose up -d db
docker compose ps
```

Copie o `.env` somente na primeira configuração. Ele é ignorado pelo Git.
As credenciais do exemplo são apenas para desenvolvimento local.
`POSTGRES_DB`, `POSTGRES_USER` e `POSTGRES_PASSWORD` são obrigatórios.
`DB_HOST=db` usa o nome do serviço na rede do Compose; `DB_PORT=5432` é a porta
interna. O banco não publica porta no Windows. A API publica a porta 8000.
A URL é montada com `SQLAlchemy.URL`, permitindo caracteres especiais na senha.

### Inspecionar antes da primeira migration

Espere o banco ficar `healthy`. Antes de aplicar a migration inicial:

```powershell
docker compose exec db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\dt"'
```

Em um banco vazio o psql informa que não encontrou relações. Se já existirem
tabelas ou dados, pare e compare o esquema com a migration. Não aplique a inicial
às cegas, não use `stamp` para ocultar diferenças e não apague banco ou volume.
A migration inicial cria tabelas e falha se elas já existirem.

```powershell
docker compose run --rm backend alembic upgrade head
docker compose up -d backend
docker compose exec backend alembic current
docker compose exec backend alembic check
```

O healthcheck do PostgreSQL e `depends_on: service_healthy` controlam a prontidão.
As migrations são um comando separado, nunca executado por worker da API.
Não usamos `create_all()` nem montamos o SQL original em `docker-entrypoint-initdb.d`.

## Endereços e diagnóstico

- API viva: [GET /health](http://localhost:8000/health), retorna `{"status":"ok"}`.
- Banco acessível: [GET /health/db](http://localhost:8000/health/db), executa `SELECT 1`.
  Retorna 200 quando conecta; falhas de conexão/timeout retornam 503 com mensagem
  genérica, sem detalhes internos ou credenciais. Não verifica versão do esquema.
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs).
- OpenAPI: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json).

```powershell
Invoke-RestMethod http://localhost:8000/health
Invoke-RestMethod http://localhost:8000/health/db
docker compose logs --tail 100 backend db
docker compose logs -f backend
docker compose ps
```

Para parar: `docker compose stop`. Para remover os containers e a rede preservando
o volume: `docker compose down`. O volume nomeado `postgres_data` mantém os dados.
Não use `down -v` para resolver problemas. Alterar credenciais no `.env` não altera
automaticamente os usuários de um PostgreSQL já inicializado.

Após editar o backend, reconstrua com `docker compose up -d --build backend`.
O código é copiado para a imagem, sem hot reload ou bind mount nesta fundação.

## Migrations futuras

Depois de alterar um model, reconstrua a imagem e gere uma migration:

```powershell
docker compose up -d --build backend
docker compose exec backend alembic revision --autogenerate -m "descreve a alteracao"
```

Como o código está na imagem, copie a migration gerada de volta ao repositório com
`docker compose cp backend:/app/alembic/versions/. ./backend/alembic/versions/`.
Revise o upgrade e o downgrade antes de aplicar. Reconstrua a imagem para incluir
o arquivo revisado, execute `alembic upgrade head` em um comando separado e
`alembic check` para conferir diferenças. Não faça downgrade em desenvolvimento
com dados: valide operações destrutivas exclusivamente no ambiente de testes.

## Testes isolados

```powershell
docker compose -f compose.test.yaml config --quiet
docker compose -f compose.test.yaml up --build --abort-on-container-exit --exit-code-from backend-test
docker compose -f compose.test.yaml down
```

O segundo Compose é independente (`radartech-test`), sem portas públicas e sem
o volume de desenvolvimento. O PostgreSQL usa `tmpfs`, com dados efêmeros.
O runner exige `RADARTECH_TEST=1`, banco `radartech_test` e um esquema vazio.
Não execute duas instâncias desse Compose de testes ao mesmo tempo.
Finalize com `down` antes de uma nova execução, pois o runner recusa banco já migrado.

O runner aplica a inicial, executa `alembic check` e pytest, faz downgrade até
`base`, verifica a remoção das tabelas da aplicação e aplica novamente a inicial.
Nenhum downgrade é executado no banco de desenvolvimento.
Cada teste de integração usa uma transação externa que é revertida no fim.

A suíte verifica as sete tabelas, diferenças entre metadata e banco, relacionamentos,
FKs, duplicidades, múltiplos comentários, defaults, Decimal, timezone, preço negativo,
exclusões CASCADE/SET NULL, saúde HTTP, Swagger e resposta 503 sem detalhes internos.

Opcionalmente, para testes sem banco no Windows (Python 3.11+; Docker usa 3.12):

```powershell
python -m venv .venv
.venv\Scripts\python -m pip install -r backend/requirements.txt
.venv\Scripts\python -m pytest -c backend/pytest.ini backend/tests -m "not integration" -v
```

Os testes de integração são ignorados fora do ambiente isolado. SQLite não é usado.

## Referências técnicas

- [SQLAlchemy assíncrono](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html).
- [Alembic com asyncio](https://alembic.sqlalchemy.org/en/latest/cookbook.html#using-asyncio-with-alembic).
- [Lifespan do FastAPI](https://fastapi.tiangolo.com/advanced/events/).
