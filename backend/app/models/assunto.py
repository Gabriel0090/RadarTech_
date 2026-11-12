from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, Identity, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.evento import Evento
    from app.models.evento_assunto import EventoAssunto


class Assunto(Base):
    __tablename__ = "assunto"

    id_assunto: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    nome: Mapped[str] = mapped_column(String(100), unique=True)

    evento_assuntos: Mapped[list[EventoAssunto]] = relationship(back_populates="assunto", passive_deletes="all", lazy="raise")
    eventos: Mapped[list[Evento]] = relationship(secondary="evento_assunto", back_populates="assuntos", viewonly=True, lazy="raise")
