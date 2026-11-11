# Radar Tech

Portal para centralizar oportunidades na área de tecnologia, como cursos, eventos, bolsas e programas de formação. A proposta é permitir que as pessoas encontrem oportunidades usando filtros como assunto, nível, preço e modalidade.

## Estado atual

O backend está implementado com FastAPI e conectado ao PostgreSQL. Segundo os testes manuais realizados pela interface `/docs`, foram validados os fluxos de cadastro, login, identificação do usuário autenticado e as demais rotas disponíveis nesta etapa.

A conexão com o banco foi confirmada pelo endpoint `/ready`.

## Tecnologias

- Python 3.11+
- FastAPI
- SQLAlchemy 2 com conexão assíncrona
- PostgreSQL
- Pydantic
- JWT para autenticação
- Bcrypt para hash de senhas

## Funcionalidades da API

- Cadastro e login de usuários
- Consulta do usuário autenticado
- Consulta e filtragem de eventos aprovados
- Sugestão de eventos por usuários autenticados
- Revisão administrativa de sugestões
- Consulta e criação de assuntos
- Comentários em eventos
- Curtidas e favoritos

A automação de e-mails (“Me avisa!”) está fora do escopo atual.

## Banco de dados

O PostgreSQL contém as tabelas:

- `usuario`
- `evento`
- `assunto`
- `evento_assunto`
- `curtida`
- `favorito`
- `comentario`

Eventos se relacionam com assuntos por meio de `evento_assunto`. Usuários podem comentar, curtir e favoritar eventos. Sugestões de eventos podem ser revisadas por um administrador.

## Executar o backend localmente no Windows

Abra o terminal do VS Code na pasta `backend`.

Crie o ambiente virtual, se ainda não existir:

```powershell
python -m venv .venv
```

Instale as dependências:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Crie `backend/.env` com as configurações do ambiente:

```env
DATABASE_URL=postgresql+asyncpg://USUARIO:SENHA@localhost:5432/NOME_DO_BANCO
JWT_SECRET_KEY=SUBSTITUA_POR_UMA_CHAVE_ALEATORIA_LONGA
ACCESS_TOKEN_EXPIRE_MINUTES=60
FRONTEND_ORIGINS=http://localhost:4200,http://127.0.0.1:4200
```

Substitua os valores de exemplo pelos dados locais do PostgreSQL. Não compartilhe nem versione o arquivo `.env`.

Inicie a API:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

## Endpoints úteis

Com a API em execução em `http://127.0.0.1:8000`:

- `/health` — verifica se a API está ativa.
- `/ready` — verifica se a API consegue acessar o PostgreSQL.
- `/docs` — documentação interativa para consultar e executar os endpoints.
- `/openapi.json` — especificação OpenAPI.

## Próximas etapas

- Revisar e consolidar as migrations do Alembic para criação e evolução do banco.
- Conectar o frontend Angular à API.
- Preparar Docker e Docker Compose para executar os serviços juntos.