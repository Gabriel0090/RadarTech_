from decimal import Decimal

import pytest
from alembic.autogenerate import compare_metadata
from alembic.migration import MigrationContext
from httpx import ASGITransport, AsyncClient
from sqlalchemy import func, inspect, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import selectinload

from app.database import get_db as app_get_db
from app.db.base import Base
from app.core.config import get_settings
from app.db.session import get_session
from app.main import app
from app.models import Assunto, Comentario, Curtida, Evento, EventoAssunto, Favorito, Usuario
from app.security import get_current_user

pytestmark = pytest.mark.integration


async def seed(session):
    user = Usuario(nome="Pessoa", email="pessoa@example.com", senha_hash="teste")
    reviewer = Usuario(nome="Revisor", email="revisor@example.com", senha_hash="teste")
    topic = Assunto(nome="Backend")
    session.add_all([user, reviewer, topic])
    await session.flush()
    event = Evento(titulo="Curso Python", preco=Decimal("10.50"), sugerido_por=user, revisor=reviewer)
    session.add(event)
    await session.flush()
    return user, reviewer, event, topic


async def test_tables_and_migration_match(db_session):
    connection = await db_session.connection()

    def check(connection):
        assert set(inspect(connection).get_table_names()) == set(Base.metadata.tables) | {"alembic_version"}
        context = MigrationContext.configure(connection, opts={"compare_type": True, "compare_server_default": True})
        assert compare_metadata(context, Base.metadata) == []

    await connection.run_sync(check)


@pytest.mark.parametrize("kind", ["curtida", "favorito", "evento_assunto", "assunto", "email"])
async def test_duplicates_rejected(db_session, kind):
    user, _, event, topic = await seed(db_session)
    factories = {
        "curtida": lambda: Curtida(id_user=user.id_user, id_evento=event.id_evento),
        "favorito": lambda: Favorito(id_user=user.id_user, id_evento=event.id_evento),
        "evento_assunto": lambda: EventoAssunto(id_evento=event.id_evento, id_assunto=topic.id_assunto),
        "assunto": lambda: Assunto(nome=topic.nome),
        "email": lambda: Usuario(nome="Outro", email=user.email, senha_hash="teste"),
    }
    if kind not in {"assunto", "email"}:
        db_session.add(factories[kind]())
        await db_session.flush()
    with pytest.raises(IntegrityError):
        async with db_session.begin_nested():
            db_session.add(factories[kind]())
            await db_session.flush()


async def test_relationships_defaults_and_multiple_comments(db_session):
    user, reviewer, event, topic = await seed(db_session)
    db_session.add_all([
        EventoAssunto(evento=event, assunto=topic),
        Curtida(usuario=user, evento=event),
        Favorito(usuario=user, evento=event),
        Comentario(usuario=user, evento=event, texto="Primeiro"),
        Comentario(usuario=user, evento=event, texto="Segundo"),
        Evento(titulo="Importação incompleta"),
    ])
    await db_session.flush()
    db_session.expire_all()
    loaded = (await db_session.scalars(select(Evento).where(Evento.titulo == "Curso Python").options(
        selectinload(Evento.sugerido_por), selectinload(Evento.revisor),
        selectinload(Evento.assuntos), selectinload(Evento.comentarios),
        selectinload(Evento.curtidas), selectinload(Evento.favoritos),
    ))).one()
    assert loaded.sugerido_por.email == "pessoa@example.com"
    assert loaded.revisor.email == "revisor@example.com"
    assert loaded.assuntos[0].nome == "Backend"
    assert len(loaded.comentarios) == 2
    assert len(loaded.curtidas) == len(loaded.favoritos) == 1
    assert loaded.preco == Decimal("10.50")
    assert loaded.criado_em.tzinfo is not None
    assert loaded.status_revisao == "pendente"
    assert loaded.sugerido_por.perfil == "usuario"
    incomplete = (await db_session.scalars(select(Evento).where(Evento.titulo == "Importação incompleta"))).one()
    assert incomplete.preco is None
    assert incomplete.id_sugerido_por is None
    assert incomplete.id_revisor is None


@pytest.mark.parametrize("model", [Curtida, Favorito, Comentario, EventoAssunto])
async def test_foreign_keys_reject_missing_event(db_session, model):
    user, _, _, topic = await seed(db_session)
    values = {"id_evento": -1}
    if model is EventoAssunto:
        values["id_assunto"] = topic.id_assunto
    else:
        values["id_user"] = user.id_user
    if model is Comentario:
        values["texto"] = "Sem evento"
    with pytest.raises(IntegrityError):
        async with db_session.begin_nested():
            db_session.add(model(**values))
            await db_session.flush()


async def test_price_constraint_and_zero(db_session):
    db_session.add(Evento(titulo="Gratuito", preco=Decimal("0.00")))
    await db_session.flush()
    with pytest.raises(IntegrityError):
        async with db_session.begin_nested():
            db_session.add(Evento(titulo="Inválido", preco=Decimal("-0.01")))
            await db_session.flush()


async def test_delete_user_sets_event_references_null_and_cascades(db_session):
    user, reviewer, event, _ = await seed(db_session)
    event_id = event.id_evento
    db_session.add_all([
        Curtida(usuario=user, evento=event), Favorito(usuario=user, evento=event),
        Comentario(usuario=user, evento=event, texto="Teste"),
    ])
    await db_session.flush()
    await db_session.delete(user)
    await db_session.delete(reviewer)
    await db_session.flush()
    db_session.expire_all()
    loaded = await db_session.get(Evento, event_id)
    assert loaded.id_sugerido_por is None and loaded.id_revisor is None
    for model in (Curtida, Favorito, Comentario):
        assert await db_session.scalar(select(func.count()).select_from(model)) == 0


async def test_delete_event_cascades(db_session):
    user, _, event, topic = await seed(db_session)
    db_session.add_all([
        EventoAssunto(evento=event, assunto=topic), Curtida(usuario=user, evento=event),
        Favorito(usuario=user, evento=event), Comentario(usuario=user, evento=event, texto="Teste"),
    ])
    await db_session.flush()
    await db_session.delete(event)
    await db_session.flush()
    for model in (EventoAssunto, Curtida, Favorito, Comentario):
        assert await db_session.scalar(select(func.count()).select_from(model)) == 0


async def test_real_db_health(db_session):
    async def isolated_session():
        yield db_session

    app.dependency_overrides[get_session] = isolated_session
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/health/db")
        assert response.status_code == 200
        assert response.json() == {"status": "ok", "database": "ok"}
    finally:
        app.dependency_overrides.clear()


async def test_real_connection_refused_returns_503(db_session):
    # Mantém o banco de testes intacto; tenta uma porta fechada no mesmo host.
    engine = create_async_engine(
        get_settings().database_url.set(port=1), connect_args={"timeout": 1},
    )
    factory = async_sessionmaker(engine)

    async def unavailable_session():
        async with factory() as session:
            yield session

    app.dependency_overrides[get_session] = unavailable_session
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/health/db")
        assert response.status_code == 503
        assert response.json() == {"detail": "Banco de dados indisponível"}
    finally:
        app.dependency_overrides.clear()
        await engine.dispose()


async def test_profile_lists_only_own_suggestions_and_updates_supported_fields(db_session):
    user, _, own_event, _ = await seed(db_session)
    other_user = Usuario(nome="Outra Pessoa", email="outra@example.com", senha_hash="teste")
    db_session.add(other_user)
    await db_session.flush()
    other_event = Evento(titulo="Sugestão de outra pessoa", sugerido_por=other_user)
    db_session.add(other_event)
    await db_session.flush()

    async def isolated_session():
        yield db_session

    async def current_user():
        return user

    app.dependency_overrides[app_get_db] = isolated_session
    app.dependency_overrides[get_current_user] = current_user
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            suggestions_response = await client.get("/api/v1/me/event-suggestions")
            profile_response = await client.patch(
                "/api/v1/auth/me",
                json={"nome": "Pessoa Atualizada", "cidade": "Recife, PE"},
            )

        assert suggestions_response.status_code == 200
        assert [event["id_evento"] for event in suggestions_response.json()] == [own_event.id_evento]
        assert profile_response.status_code == 200
        assert profile_response.json()["nome"] == "Pessoa Atualizada"
        assert profile_response.json()["cidade"] == "Recife, PE"
    finally:
        app.dependency_overrides.clear()

async def test_registration_login_and_suggestion_round_trip(db_session):
    async def isolated_session():
        yield db_session

    app.dependency_overrides[app_get_db] = isolated_session
    app.dependency_overrides[get_session] = isolated_session
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            registered = await client.post("/api/v1/auth/register", json={
                "nome": "Pessoa Teste", "email": "fluxo@example.com", "senha": "senha-segura-123",
                "telefone": "11999999999", "cidade": "Recife",
            })
            assert registered.status_code == 201, registered.text
            assert registered.json()["cidade"] == "Recife"
            login = await client.post("/api/v1/auth/login", json={"email": "fluxo@example.com", "senha": "senha-segura-123"})
            assert login.status_code == 200, login.text
            headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
            submitted = await client.post("/api/v1/events/suggestions", headers=headers, json={
                "titulo": "Oficina de teste", "tipo": "Workshop", "modalidade": "Online",
                "data_inicio": "2027-03-15T18:00:00Z", "preco": None,
                "url_inscricao": "https://example.com/inscricao", "url_imagem": "https://example.com/banner.png",
                "contato_sugestao": "contato@example.com", "instituicao": "Comunidade",
            })
            assert submitted.status_code == 201, submitted.text
            item = submitted.json()
            assert item["status_revisao"] == "pendente"
            assert item["url_imagem"] == "https://example.com/banner.png"
            assert item["contato_sugestao"] == "contato@example.com"
            assert item["preco"] is None
            mine = await client.get("/api/v1/me/event-suggestions", headers=headers)
            assert any(event["id_evento"] == item["id_evento"] for event in mine.json())
            public = await client.get("/api/v1/events")
            assert all(event["id_evento"] != item["id_evento"] for event in public.json())
    finally:
        app.dependency_overrides.clear()
