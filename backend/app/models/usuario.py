from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, DateTime, Identity, String, Text, func, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.evento import Evento
    from app.models.curtida import Curtida
    from app.models.favorito import Favorito
    from app.models.comentario import Comentario


class Usuario(Base):
    __tablename__ = "usuario"

    id_user: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    nome: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(254), unique=True)
    senha_hash: Mapped[str] = mapped_column(Text)
    perfil: Mapped[str] = mapped_column(String(20), server_default=text("'usuario'"))
    telefone: Mapped[str | None] = mapped_column(String(30))
    cidade: Mapped[str | None] = mapped_column(String(120))
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    eventos_sugeridos: Mapped[list[Evento]] = relationship(
        back_populates="sugerido_por", foreign_keys="Evento.id_sugerido_por", passive_deletes="all", lazy="raise",
    )
    eventos_revisados: Mapped[list[Evento]] = relationship(
        back_populates="revisor", foreign_keys="Evento.id_revisor", passive_deletes="all", lazy="raise",
    )
    curtidas: Mapped[list[Curtida]] = relationship(back_populates="usuario", passive_deletes="all", lazy="raise")
    favoritos: Mapped[list[Favorito]] = relationship(back_populates="usuario", passive_deletes="all", lazy="raise")
    comentarios: Mapped[list[Comentario]] = relationship(back_populates="usuario", passive_deletes="all", lazy="raise")
