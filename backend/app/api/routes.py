from app.schemas import AssuntoCreate, AssuntoResponse
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.models import Assunto, Comentario, Curtida, Evento, Favorito, Usuario
from app.schemas import (
    ComentarioCreate,
    ComentarioResponse,
    EventoCreate,
    EventoResponse,
    LoginRequest,
    RevisaoEvento,
    TokenResponse,
    UsuarioCreate,
    UsuarioResponse,
)
from app.security import (
    create_access_token,
    get_current_user,
    hash_password,
    require_admin,
    verify_password,
)

api_router = APIRouter(prefix="/api/v1")


def evento_para_resposta(evento: Evento) -> EventoResponse:
    dados = {column.name: getattr(evento, column.name) for column in Evento.__table__.columns}
    dados["assuntos"] = [assunto.nome for assunto in evento.assuntos]
    return EventoResponse.model_validate(dados)


def exigir_evento_publicado(evento: Evento | None) -> Evento:
    if evento is None or evento.status_revisao != "aprovado":
        raise HTTPException(status_code=404, detail="Oportunidade não encontrada")
    return evento


@api_router.post(
    "/auth/register",
    response_model=UsuarioResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["autenticação"],
)
async def registrar_usuario(
    dados: UsuarioCreate,
    session: AsyncSession = Depends(get_db),
):
    email = dados.email.strip().lower()
    existente = await session.scalar(select(Usuario).where(Usuario.email == email))
    if existente:
        raise HTTPException(status_code=409, detail="Este e-mail já está cadastrado")

    try:
        usuario = Usuario(
            nome=dados.nome.strip(),
            email=email,
            senha_hash=hash_password(dados.senha),
            telefone=dados.telefone,
            cidade=dados.cidade,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    session.add(usuario)
    try:
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    await session.refresh(usuario)
    return usuario


@api_router.post(
    "/auth/login",
    response_model=TokenResponse,
    tags=["autenticação"],
)
async def login(
    dados: LoginRequest,
    session: AsyncSession = Depends(get_db),
):
    email = dados.email.strip().lower()
    usuario = await session.scalar(select(Usuario).where(Usuario.email == email))
    if usuario is None or not verify_password(dados.senha, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return TokenResponse(access_token=create_access_token(usuario.id_user))


@api_router.get(
    "/auth/me",
    response_model=UsuarioResponse,
    tags=["autenticação"],
)
async def obter_usuario_atual(
    usuario: Usuario = Depends(get_current_user),
):
    return usuario


@api_router.get(
    "/events",
    response_model=list[EventoResponse],
    tags=["oportunidades"],
)
async def listar_oportunidades(
    assunto: str | None = None,
    nivel: str | None = None,
    modalidade: str | None = None,
    preco_min: float | None = Query(default=None, ge=0),
    preco_max: float | None = Query(default=None, ge=0),
    busca: str | None = None,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    session: AsyncSession = Depends(get_db),
):
    if preco_min is not None and preco_max is not None and preco_min > preco_max:
        raise HTTPException(status_code=422, detail="preco_min não pode superar preco_max")

    consulta = (
        select(Evento)
        .options(selectinload(Evento.assuntos))
        .where(Evento.status_revisao == "aprovado")
    )
    if assunto:
        consulta = consulta.where(Evento.assuntos.any(Assunto.nome.ilike(assunto.strip())))
    if nivel:
        consulta = consulta.where(Evento.nivel.ilike(nivel.strip()))
    if modalidade:
        consulta = consulta.where(Evento.modalidade.ilike(modalidade.strip()))
    if preco_min is not None:
        consulta = consulta.where(Evento.preco >= preco_min)
    if preco_max is not None:
        consulta = consulta.where(Evento.preco <= preco_max)
    if busca:
        consulta = consulta.where(Evento.titulo.ilike(f"%{busca.strip()}%"))

    consulta = consulta.order_by(Evento.criado_em.desc()).offset(offset).limit(limit)
    eventos = (await session.scalars(consulta)).all()
    return [evento_para_resposta(evento) for evento in eventos]


@api_router.get(
    "/events/{event_id}",
    response_model=EventoResponse,
    tags=["oportunidades"],
)
async def obter_oportunidade(
    event_id: int,
    session: AsyncSession = Depends(get_db),
):
    evento = await session.scalar(
        select(Evento)
        .options(selectinload(Evento.assuntos))
        .where(Evento.id_evento == event_id)
    )
    exigir_evento_publicado(evento)
    return evento_para_resposta(evento)


@api_router.post(
    "/events/suggestions",
    response_model=EventoResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["sugestões"],
)
async def sugerir_oportunidade(
    dados: EventoCreate,
    usuario: Usuario = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    assuntos = []
    if dados.assunto_ids:
        assuntos = list(
            (
                await session.scalars(
                    select(Assunto).where(Assunto.id_assunto.in_(dados.assunto_ids))
                )
            ).all()
        )
        if len(assuntos) != len(set(dados.assunto_ids)):
            raise HTTPException(status_code=422, detail="Um ou mais assuntos não existem")

    evento = Evento(
        **dados.model_dump(exclude={"assunto_ids"}),
        contato_sugestao=usuario.email,
        id_sugerido_por=usuario.id_user,
        assuntos=assuntos,
    )
    session.add(evento)
    await session.commit()
    await session.refresh(evento)
    return evento_para_resposta(evento)


@api_router.get(
    "/admin/event-suggestions",
    response_model=list[EventoResponse],
    tags=["moderação"],
)
async def listar_sugestoes_pendentes(
    _: Usuario = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
):
    eventos = (
        await session.scalars(
            select(Evento)
            .options(selectinload(Evento.assuntos))
            .where(Evento.status_revisao == "pendente")
            .order_by(Evento.criado_em.asc())
        )
    ).all()
    return [evento_para_resposta(evento) for evento in eventos]


@api_router.patch(
    "/admin/event-suggestions/{event_id}",
    response_model=EventoResponse,
    tags=["moderação"],
)
async def revisar_sugestao(
    event_id: int,
    revisao: RevisaoEvento,
    revisor: Usuario = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
):
    evento = await session.scalar(
        select(Evento)
        .options(selectinload(Evento.assuntos))
        .where(Evento.id_evento == event_id)
    )
    if evento is None:
        raise HTTPException(status_code=404, detail="Sugestão não encontrada")

    evento.status_revisao = revisao.status_revisao
    evento.id_revisor = revisor.id_user
    evento.revisado_em = datetime.now(timezone.utc)
    await session.commit()
    await session.refresh(evento)
    return evento_para_resposta(evento)


@api_router.get(
    "/events/{event_id}/comments",
    response_model=list[ComentarioResponse],
    tags=["comentários"],
)
async def listar_comentarios(
    event_id: int,
    session: AsyncSession = Depends(get_db),
):
    evento = await session.get(Evento, event_id)
    exigir_evento_publicado(evento)
    comentarios = (
        await session.scalars(
            select(Comentario)
            .options(selectinload(Comentario.usuario))
            .where(Comentario.id_evento == event_id)
            .order_by(Comentario.criado_em.asc())
        )
    ).all()
    return [
        ComentarioResponse(
            id_comentario=comentario.id_comentario,
            id_user=comentario.id_user,
            nome_usuario=comentario.usuario.nome,
            id_evento=comentario.id_evento,
            texto=comentario.texto,
            criado_em=comentario.criado_em,
        )
        for comentario in comentarios
    ]


@api_router.post(
    "/events/{event_id}/comments",
    response_model=ComentarioResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["comentários"],
)
async def criar_comentario(
    event_id: int,
    dados: ComentarioCreate,
    usuario: Usuario = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    evento = await session.get(Evento, event_id)
    exigir_evento_publicado(evento)
    comentario = Comentario(
        id_user=usuario.id_user,
        id_evento=event_id,
        texto=dados.texto.strip(),
    )
    session.add(comentario)
    await session.commit()
    await session.refresh(comentario)
    return ComentarioResponse(
        id_comentario=comentario.id_comentario,
        id_user=usuario.id_user,
        nome_usuario=usuario.nome,
        id_evento=event_id,
        texto=comentario.texto,
        criado_em=comentario.criado_em,
    )


@api_router.post("/events/{event_id}/likes", tags=["interações"])
async def curtir_oportunidade(
    event_id: int,
    usuario: Usuario = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    evento = await session.get(Evento, event_id)
    exigir_evento_publicado(evento)
    curtida = await session.get(Curtida, (usuario.id_user, event_id))
    if curtida is None:
        session.add(Curtida(id_user=usuario.id_user, id_evento=event_id))
        await session.commit()
    return {"curtida": True}


@api_router.delete(
    "/events/{event_id}/likes",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
    tags=["interações"],
)
async def remover_curtida(
    event_id: int,
    usuario: Usuario = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    curtida = await session.get(Curtida, (usuario.id_user, event_id))
    if curtida is not None:
        await session.delete(curtida)
        await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@api_router.post("/events/{event_id}/favorites", tags=["interações"])
async def favoritar_oportunidade(
    event_id: int,
    usuario: Usuario = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    evento = await session.get(Evento, event_id)
    exigir_evento_publicado(evento)
    favorito = await session.get(Favorito, (usuario.id_user, event_id))
    if favorito is None:
        session.add(Favorito(id_user=usuario.id_user, id_evento=event_id))
        await session.commit()
    return {"favorito": True}


@api_router.delete(
    "/events/{event_id}/favorites",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
    tags=["interações"],
)
async def remover_favorito(
    event_id: int,
    usuario: Usuario = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    favorito = await session.get(Favorito, (usuario.id_user, event_id))
    if favorito is not None:
        await session.delete(favorito)
        await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@api_router.get(
    "/me/favorites",
    response_model=list[EventoResponse],
    tags=["interações"],
)
async def listar_favoritos(
    usuario: Usuario = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    eventos = (
        await session.scalars(
            select(Evento)
            .join(Favorito, Favorito.id_evento == Evento.id_evento)
            .options(selectinload(Evento.assuntos))
            .where(Favorito.id_user == usuario.id_user)
            .order_by(Favorito.criado_em.desc())
        )
    ).all()
    return [evento_para_resposta(evento) for evento in eventos]


@api_router.get("/events/{event_id}/likes/count", tags=["interações"])
async def contar_curtidas(
    event_id: int,
    session: AsyncSession = Depends(get_db),
):
    evento = await session.get(Evento, event_id)
    exigir_evento_publicado(evento)
    total = await session.scalar(
        select(func.count()).select_from(Curtida).where(Curtida.id_evento == event_id)
    )
    return {"total": total or 0}


@api_router.get("/subjects", tags=["assuntos"])
async def listar_assuntos(session: AsyncSession = Depends(get_db)):
    assuntos = (
        await session.scalars(select(Assunto).order_by(Assunto.nome.asc()))
    ).all()
    return [{"id_assunto": assunto.id_assunto, "nome": assunto.nome} for assunto in assuntos]


@api_router.post(
    "/admin/subjects",
    response_model=AssuntoResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["assuntos"],
)
async def criar_assunto(
    dados: AssuntoCreate,
    _: Usuario = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
):
    nome = dados.nome.strip()
    existente = await session.scalar(select(Assunto).where(Assunto.nome.ilike(nome)))
    if existente:
        raise HTTPException(status_code=409, detail="Este assunto já existe")

    assunto = Assunto(nome=nome)
    session.add(assunto)
    await session.commit()
    await session.refresh(assunto)
    return assunto
