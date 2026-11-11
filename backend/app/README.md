# RadarTech — arquitetura

Monorepo de um portal educacional de oportunidades em programação. As publicações
representam cursos, eventos, palestras, hackathons, bolsas e programas de formação.
A inscrição ocorre no site da instituição responsável.

## Visão geral

```text
Cliente HTTP
    |
    | HTTP :8000
    v
FastAPI / Uvicorn
    |
    | AsyncSession -> SQLAlchemy 2.0 -> asyncpg
    v
PostgreSQL 15
    |
    v
Volume nomeado postgres_data

Alembic ---- migrations executadas separadamente ----> PostgreSQL
```

O Docker Compose mantém API e banco na mesma rede privada. Apenas a API publica
uma porta no host. O PostgreSQL possui healthcheck e o backend aguarda sua
prontidão. O banco persiste os dados em um volume nomeado.

## Componentes implementados

| Camada | Tecnologia | Responsabilidade |
| --- | --- | --- |
| API | Python 3.12, FastAPI e Uvicorn | Receber requisições HTTP e expor OpenAPI/Swagger |
| Configuração | Pydantic Settings | Validar variáveis de ambiente e montar a conexão |
| Persistência | SQLAlchemy 2.0 assíncrono e asyncpg | Mapear tabelas e gerenciar sessões e consultas |
| Banco | PostgreSQL 15 | Armazenar dados e aplicar integridade referencial |
| Evolução do esquema | Alembic | Versionar a criação e alteração das tabelas |
| Infraestrutura | Docker e Docker Compose | Empacotar serviços, rede e volume |
| Testes | pytest, HTTPX e PostgreSQL isolado | Verificar HTTP, relacionamentos, restrições e migrations |

O engine é compartilhado pela aplicação e encerrado no lifespan. Cada requisição
recebe uma AsyncSession própria, fechada ao término. As migrations não são
executadas na inicialização da API ou em cada worker.

`GET /health` verifica se a API responde. `GET /health/db` executa `SELECT 1` e
retorna 503 quando o banco está indisponível, sem expor credenciais. A documentação
interativa está em `/docs`, e o esquema OpenAPI em `/openapi.json`.

## Organização do monorepo

```text
RadarTech_/
├── backend/
│   ├── app/
│   │   ├── api/          # Rotas HTTP
│   │   ├── core/         # Configuração validada
│   │   ├── db/           # Base declarativa, engine e sessões
│   │   ├── models/       # Um model por tabela
│   │   └── main.py       # Aplicação e ciclo de vida
│   ├── alembic/          # Migration inicial e evolução do esquema
│   ├── tests/            # Testes HTTP e de integração
│   ├── Dockerfile
│   └── requirements.txt
├── database/
│   └── radarDatabase.sql # Referência original preservada
├── compose.yaml          # Desenvolvimento com banco persistente
├── compose.test.yaml     # Testes com PostgreSQL efêmero em tmpfs
├── .env.example
└── CONTRIBUTING.md       # Fluxo de trabalho e execução local
```

## Modelo de dados

| Tabela | Papel e relacionamentos |
| --- | --- |
| `usuario` | Identidade do usuário; pode sugerir e revisar eventos e ter interações |
| `evento` | Publicação manual ou importada, diferenciada pela origem; autor e revisor opcionais |
| `assunto` | Tema com nome único |
| `evento_assunto` | Associação N:M entre evento e assunto, sem repetição do par |
| `curtida` | Associação entre usuário e evento, sem repetição do par |
| `favorito` | Associação entre usuário e evento, sem repetição do par |
| `comentario` | Texto com identidade própria; permite vários por usuário e evento |

As chaves são BIGINT e as datas relevantes usam timezone. Preço é NUMERIC(12,2),
representado por Decimal no Python: zero significa gratuito e NULL, desconhecido.
O banco rejeita preço negativo.

Os relacionamentos de sugestão e revisão especificam suas chaves estrangeiras
separadamente. Excluir um usuário define essas referências no evento como NULL;
as interações e associações mantêm as exclusões CASCADE previstas no SQL original.
Curtidas, favoritos e evento/assunto têm chaves primárias compostas.

Nulabilidades, tamanhos, defaults e regras de exclusão seguem o SQL de referência.
`evento.url_fonte TEXT NULL` é o acréscimo ao esquema original. As constraints
possuem nomes previsíveis para facilitar migrations futuras. `alembic_version`
é uma tabela técnica de controle, além das sete tabelas do domínio.

Os relacionamentos usam `lazy="raise"` para exigir carregamento explícito no fluxo
assíncrono. `Evento.assuntos` e `Assunto.eventos` são atalhos de leitura; a escrita
passa por `EventoAssunto`.

## Limites e evolução prevista

Esta fundação implementa infraestrutura, persistência, migrations e saúde da API.
O frontend previsto é React com JavaScript, Vite e CSS responsivo mobile first.
Autenticação, permissões, CRUD e integração externa serão implementados depois.
Nenhuma API externa foi escolhida ou validada.

Visitantes consultarão somente publicações aprovadas. Usuários autenticados poderão
sugerir oportunidades, favoritar, curtir e comentar. A administração revisará as
sugestões e gerenciará publicações. Não há inscrição própria, pagamentos ou resumo
por e-mail no escopo.

Campos incompletos são permitidos durante a revisão. `perfil` permanece VARCHAR
com default `usuario`; `status_revisao` permanece VARCHAR com default `pendente`.
Os estados discutidos são `pendente`, `aprovada` e `rejeitada`. A validação de
publicação, a exigência de ao menos um assunto e a política de importações ainda
precisam ser consolidadas.

As instruções de configuração, execução, migrations, testes e contribuição estão
em [CONTRIBUTING.md](CONTRIBUTING.md).
