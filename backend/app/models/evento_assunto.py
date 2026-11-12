from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.evento import Evento
    from app.models.assunto import Assunto


class EventoAssunto(Base):
    __tablename__ = "evento_assunto"

    id_evento: Mapped[int] = mapped_column(BigInteger, ForeignKey("evento.id_evento", ondelete="CASCADE"), primary_key=True)
    id_assunto: Mapped[int] = mapped_column(BigInteger, ForeignKey("assunto.id_assunto", ondelete="CASCADE"), primary_key=True)

    evento: Mapped[Evento] = relationship(back_populates="evento_assuntos", lazy="raise")
    assunto: Mapped[Assunto] = relationship(back_populates="evento_assuntos", lazy="raise")
