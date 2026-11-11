from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, DateTime, ForeignKey, Identity, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.usuario import Usuario
    from app.models.evento import Evento


class Comentario(Base):
    __tablename__ = "comentario"

    id_comentario: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    id_user: Mapped[int] = mapped_column(BigInteger, ForeignKey("usuario.id_user", ondelete="CASCADE"))
    id_evento: Mapped[int] = mapped_column(BigInteger, ForeignKey("evento.id_evento", ondelete="CASCADE"))
    texto: Mapped[str] = mapped_column(Text)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    usuario: Mapped[Usuario] = relationship(back_populates="comentarios", lazy="raise")
    evento: Mapped[Evento] = relationship(back_populates="comentarios", lazy="raise")
