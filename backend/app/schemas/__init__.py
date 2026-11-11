import re
from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class UsuarioCreate(BaseModel):
    nome: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=5, max_length=254)
    senha: str = Field(min_length=8, max_length=72)
    telefone: str | None = Field(default=None, max_length=30)
    cidade: str | None = Field(default=None, max_length=120)

    @field_validator("email")
    @classmethod
    def validar_email(cls, value: str) -> str:
        value = value.strip().lower()
        if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", value):
            raise ValueError("Informe um e-mail válido")
        return value


class LoginRequest(BaseModel):
    email: str
    senha: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UsuarioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_user: int
    nome: str
    email: str
    perfil: str
    criado_em: datetime


class EventoCreate(BaseModel):
    titulo: str = Field(min_length=1, max_length=200)
    descricao: str | None = None
    tipo: str | None = Field(default=None, max_length=50)
    instituicao: str | None = Field(default=None, max_length=200)
    publico_alvo: str | None = None
    requisitos: str | None = None
    nivel: str | None = Field(default=None, max_length=50)
    modalidade: str | None = Field(default=None, max_length=20)
    preco: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    cidade: str | None = Field(default=None, max_length=120)
    estado: str | None = Field(default=None, max_length=100)
    data_inicio: datetime | None = None
    data_fim: datetime | None = None
    prazo_inscricao: datetime | None = None
    url_inscricao: str | None = None
    assunto_ids: list[int] = Field(default_factory=list)


class EventoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_evento: int
    titulo: str
    descricao: str | None
    tipo: str | None
    instituicao: str | None
    publico_alvo: str | None
    requisitos: str | None
    nivel: str | None
    modalidade: str | None
    preco: Decimal | None
    cidade: str | None
    estado: str | None
    data_inicio: datetime | None
    data_fim: datetime | None
    prazo_inscricao: datetime | None
    url_inscricao: str | None
    origem: str | None
    fonte_externa: str | None
    id_externo: str | None
    importado_em: datetime | None
    status_revisao: str
    contato_sugestao: str | None
    id_sugerido_por: int | None
    id_revisor: int | None
    revisado_em: datetime | None
    criado_em: datetime
    assuntos: list[str] = Field(default_factory=list)


class ComentarioCreate(BaseModel):
    texto: str = Field(min_length=1, max_length=5000)


class ComentarioResponse(BaseModel):
    id_comentario: int
    id_user: int
    nome_usuario: str
    id_evento: int
    texto: str
    criado_em: datetime


class RevisaoEvento(BaseModel):
    status_revisao: Literal["aprovado", "rejeitado"]


class AssuntoCreate(BaseModel):
    nome: str = Field(min_length=1, max_length=100)


class AssuntoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_assunto: int
    nome: str
