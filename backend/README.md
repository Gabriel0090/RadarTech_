# Radar Tech 🚀

Portal para centralizar oportunidades na área de tecnologia, como cursos, eventos, bolsas e programas de formação. A plataforma permite que os usuários encontrem oportunidades utilizando filtros por assunto, nível, preço e modalidade.

---

## 📑 Índice

- [Sobre o projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias utilizadas](#-tecnologias-utilizadas)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Configuração do ambiente](#-configuração-do-ambiente)
- [Banco de dados](#-banco-de-dados)
- [Executando o backend](#-executando-o-backend)
- [Executando o frontend](#-executando-o-frontend)
- [API e endpoints](#-api-e-endpoints)
- [Autenticação](#-autenticação)
- [Testes](#-testes)
- [Docker](#-docker)
- [Git e fluxo de desenvolvimento](#-git-e-fluxo-de-desenvolvimento)
- [Próximas etapas](#-próximas-etapas)
- [Segurança](#-segurança)

---

## 🎯 Sobre o projeto

O Radar Tech é uma plataforma desenvolvida com o objetivo de facilitar o acesso a oportunidades educacionais e profissionais na área de tecnologia.

A proposta é reunir em um único ambiente informações sobre:

- Cursos e capacitações.
- Eventos e palestras.
- Bolsas de estudo.
- Programas de formação.
- Oportunidades de desenvolvimento profissional.

A plataforma busca simplificar a descoberta dessas oportunidades, oferecendo filtros que permitem encontrar conteúdos de acordo com os interesses e necessidades de cada usuário.

## ✨ Funcionalidades

O projeto contempla as seguintes funcionalidades:

- Cadastro de usuários.
- Login e autenticação.
- Consulta dos dados do usuário autenticado.
- Listagem de eventos e oportunidades aprovadas.
- Filtragem de eventos.
- Sugestão de novos eventos por usuários autenticados.
- Revisão e aprovação de eventos por administradores.
- Cadastro e consulta de assuntos.
- Curtidas em eventos.
- Sistema de favoritos.
- Comentários em eventos.

**Observação:** A funcionalidade de notificações por e-mail e o recurso "Me avisa!" não fazem parte do escopo inicial do MVP.

## 🛠️ Tecnologias utilizadas

### Backend

- Python 3.11+
- FastAPI
- SQLAlchemy 2
- AsyncPG
- Alembic
- Pydantic
- Pydantic Settings
- JWT (JSON Web Token)
- Bcrypt
- PostgreSQL 15+

### Frontend

- React
- Vite
- TypeScript

> A stack do frontend deve ser conferida no package.json da branch integrada. Esta documentação considera a implementação React com Vite apresentada nos arquivos e commits analisados.

### Infraestrutura e ferramentas

- Docker
- Docker Compose
- Nginx
- Git
- GitHub

## 📁 Estrutura do projeto

```text
RadarTech/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── main.py
│   │   └── security.py
│   │
│   ├── alembic/
│   ├── tests/
│   ├── Dockerfile
│   ├── alembic.ini
│   └── requirements.txt
│
├── database/
│   └── radarDatabase.sql
│
├── Frontend/
│   └── RadarTech/
│
├── compose.yaml
├── compose.test.yaml
├── .env.example
└── README.md
```

A estrutura pode sofrer alterações conforme a integração das branches e a evolução do projeto.

## 📋 Pré-requisitos

Antes de executar o projeto, certifique-se de possuir as seguintes ferramentas instaladas:

- Git
- Python 3.11 ou superior
- PostgreSQL 15 ou superior
- Node.js
- npm
- Docker Desktop (opcional)

## ⚙️ Configuração do ambiente

### 1. Clonar o repositório

```bash
git clone URL_DO_REPOSITORIO
```

Entre na pasta do projeto:

```bash
cd RadarTech
```

### 2. Configurar as variáveis de ambiente

Utilize o arquivo `.env.example` como referência para configurar as variáveis necessárias.

Não compartilhe arquivos `.env` com credenciais reais.

## 🗄️ Banco de dados

O projeto utiliza PostgreSQL como sistema gerenciador de banco de dados.

O script inicial de criação do banco está localizado em:

```text
database/radarDatabase.sql
```

### Criar o banco de dados

No terminal, execute:

```bash
createdb -U postgres radar_tech
```

Alternativamente, o banco pode ser criado utilizando o pgAdmin.

### Executar o script SQL

Na raiz do projeto:

```powershell
psql -U postgres -d radar_tech -f .\database\radarDatabase.sql
```

O script inicial contém a estrutura das seguintes tabelas:

| Tabela | Descrição |
|---|---|
| usuario | Armazena os dados dos usuários. |
| evento | Armazena os eventos e oportunidades. |
| assunto | Armazena os assuntos e categorias. |
| evento_assunto | Relaciona eventos e assuntos. |
| curtida | Registra as curtidas dos usuários. |
| favorito | Armazena os eventos favoritados. |
| comentario | Armazena comentários dos usuários. |

As relações entre eventos e assuntos são estabelecidas por meio da tabela `evento_assunto`.

As tabelas de curtidas e favoritos relacionam usuários e eventos, enquanto os comentários pertencem a um usuário e a um evento.

**Importante:** Caso as tabelas já existam, verifique a estrutura antes de executar novamente o script SQL.

## 🐍 Executando o backend

### 1. Acessar a pasta

```powershell
cd backend
```

### 2. Criar o ambiente virtual

```powershell
python -m venv .venv
```

### 3. Instalar as dependências

No Windows, utilizando PowerShell:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### 4. Configurar o arquivo .env

Crie um arquivo chamado `.env` dentro da pasta `backend`.

Exemplo de configuração:

```env
DATABASE_URL=postgresql+asyncpg://USUARIO:SENHA@localhost:5432/radar_tech

JWT_SECRET_KEY=SUBSTITUA_POR_UMA_CHAVE_ALEATORIA_LONGA

ACCESS_TOKEN_EXPIRE_MINUTES=60

FRONTEND_ORIGINS=http://localhost:5173
```

Substitua `USUARIO` e `SENHA` pelas credenciais utilizadas no PostgreSQL.

### 5. Iniciar o servidor

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

O backend estará disponível em:

```text
http://127.0.0.1:8000
```

### Documentação interativa

Com o backend em execução, acesse:

```text
http://127.0.0.1:8000/docs
```

A documentação permite visualizar e testar os endpoints disponibilizados pela API.

## ⚛️ Executando o frontend

Abra outro terminal e acesse a pasta do frontend:

```powershell
cd Frontend/RadarTech
```

### 1. Instalar as dependências

```powershell
npm install
```

### 2. Configurar a API

O endereço da API pode ser configurado por meio da variável:

```env
VITE_API_URL=http://127.0.0.1:8000
```

### 3. Iniciar o frontend

```powershell
npm run dev
```

O frontend estará disponível no endereço padrão do Vite:

```text
http://localhost:5173
```

**Observação:** Caso exista um arquivo `.env.example` dentro do frontend, utilize-o como referência para criar o arquivo `.env`.

## 🔌 API e endpoints

O backend disponibiliza uma API REST desenvolvida com FastAPI.

Os principais endpoints de infraestrutura são:

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/health` | Verifica se a API está ativa. |
| GET | `/ready` | Verifica a disponibilidade da conexão com o banco. |
| GET | `/docs` | Documentação interativa da API. |
| GET | `/openapi.json` | Especificação OpenAPI. |

### Principais endpoints de autenticação

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/api/v1/auth/register` | Cadastro de usuário. |
| POST | `/api/v1/auth/login` | Login e geração do token JWT. |
| GET | `/api/v1/auth/me` | Consulta dos dados do usuário autenticado. |

Para consultar os demais endpoints, acesse a documentação interativa:

```text
http://127.0.0.1:8000/docs
```

## 🔐 Autenticação

A autenticação da aplicação utiliza JWT (JSON Web Token).

Após realizar o login, a API retorna um token que deve ser utilizado nas requisições que exigem autenticação.

O token deve ser enviado no cabeçalho HTTP:

```http
Authorization: Bearer SEU_TOKEN_JWT
```

As senhas dos usuários são armazenadas utilizando hash com Bcrypt, evitando o armazenamento de senhas em texto puro.

## 🧪 Testes

Os testes automatizados do backend estão localizados em:

```text
backend/tests/
```

Para executar os testes, acesse a pasta `backend` e execute:

```powershell
.\.venv\Scripts\python.exe -m pytest
```

Alguns testes de integração podem exigir um banco PostgreSQL de teste configurado.

Consulte os arquivos de configuração e o `compose.test.yaml` antes de executar os testes de integração.

## 🐳 Docker

O projeto possui arquivos de configuração para execução utilizando Docker Compose:

```text
compose.yaml
compose.test.yaml
```

Antes de executar os contêineres, certifique-se de que o Docker Desktop esteja instalado e em execução.

### Verificar a configuração

```powershell
docker compose config
```

### Construir e iniciar os serviços

```powershell
docker compose up --build
```

### Encerrar os serviços

```powershell
docker compose down
```

Os serviços, portas e variáveis dependem da configuração atual dos arquivos Compose.

## 🌿 Git e fluxo de desenvolvimento

O projeto utiliza Git para controle de versão e organização do desenvolvimento em branches.

### Branches principais

| Branch | Finalidade |
|---|---|
| `main` | Versão principal e estável do projeto. |
| `dev` | Integração das funcionalidades desenvolvidas. |
| `feature/*` | Desenvolvimento de funcionalidades específicas. |

### Criar uma nova branch

Atualize a branch de desenvolvimento:

```bash
git switch dev
git pull origin dev
```

Crie uma branch para a nova funcionalidade:

```bash
git switch -c feature/nome-da-funcionalidade
```

### Enviar alterações

Adicione os arquivos modificados:

```bash
git add .
```

Crie um commit:

```bash
git commit -m "feat: descricao da funcionalidade"
```

Envie a branch para o repositório remoto:

```bash
git push -u origin feature/nome-da-funcionalidade
```

### Pull Request

Após finalizar o desenvolvimento:

1. Acesse o GitHub.
2. Abra um Pull Request da branch de funcionalidade para `dev`.
3. Revise os arquivos modificados.
4. Verifique possíveis conflitos.
5. Aguarde a validação e integração das alterações.

## 🚧 Próximas etapas

As próximas etapas previstas para a evolução do projeto incluem:

- [ ] Consolidar a integração entre frontend e backend.
- [ ] Validar o funcionamento completo da autenticação.
- [ ] Consolidar as migrations utilizando Alembic.
- [ ] Validar a estrutura do banco de dados.
- [ ] Testar a aplicação utilizando Docker Compose.
- [ ] Ampliar a cobertura de testes automatizados.
- [ ] Melhorar a documentação dos endpoints.
- [ ] Validar o fluxo de aprovação de eventos.
- [ ] Aprimorar os filtros e a experiência de navegação.

## 🛡️ Segurança

Algumas práticas importantes para manter a segurança do projeto:

- Não versionar arquivos `.env`.
- Não compartilhar credenciais do banco de dados.
- Não expor chaves secretas JWT.
- Utilizar hash para armazenar senhas.
- Validar os dados recebidos pela API.
- Proteger endpoints que exigem autenticação.
- Utilizar valores fictícios nos exemplos de configuração.

---

## 📌 Status do projeto

O Radar Tech encontra-se em desenvolvimento, com implementação de funcionalidades de frontend, backend e integração com banco de dados.

A documentação será atualizada conforme a evolução da aplicação e a consolidação da arquitetura.

---

**Radar Tech** — Conectando pessoas a oportunidades na tecnologia. 🚀