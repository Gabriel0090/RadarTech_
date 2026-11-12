from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, CheckConstraint, DateTime, ForeignKey, Identity, Numeric, String, Text, func, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.usuario import Usuario
    from app.models.assunto import Assunto
    from app.models.evento_assunto import EventoAssunto
    from app.models.curtida import Curtida
    from app.models.favorito import Favorito
    from app.models.comentario import Comentario


class Evento(Base):
    __tablename__ = "evento"
    __table_args__ = (CheckConstraint("preco IS NULL OR preco >= 0", name="preco_nao_negativo"),)

    id_evento: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    titulo: Mapped[str] = mapped_column(String(200))
    descricao: Mapped[str | None] = mapped_column(Text)
    tipo: Mapped[str | None] = mapped_column(String(50))
    instituicao: Mapped[str | None] = mapped_column(String(200))
    publico_alvo: Mapped[str | None] = mapped_column(Text)
    requisitos: Mapped[str | None] = mapped_column(Text)
    nivel: Mapped[str | None] = mapped_column(String(50))
    modalidade: Mapped[str | None] = mapped_column(String(20))
    preco: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    cidade: Mapped[str | None] = mapped_column(String(120))
    estado: Mapped[str | None] = mapped_column(String(100))
    data_inicio: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    data_fim: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    prazo_inscricao: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    url_inscricao: Mapped[str | None] = mapped_column(Text)
    url_fonte: Mapped[str | None] = mapped_column(Text)
    origem: Mapped[str | None] = mapped_column(String(30))
    fonte_externa: Mapped[str | None] = mapped_column(String(100))
    id_externo: Mapped[str | None] = mapped_column(String(200))
    importado_em: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    status_revisao: Mapped[str] = mapped_column(String(20), server_default=text("'pendente'"))
    contato_sugestao: Mapped[str | None] = mapped_column(String(254))
    id_sugerido_por: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("usuario.id_user", ondelete="SET NULL"))
    id_revisor: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("usuario.id_user", ondelete="SET NULL"))
    revisado_em: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    sugerido_por: Mapped[Usuario | None] = relationship(back_populates="eventos_sugeridos", foreign_keys=[id_sugerido_por], lazy="raise")
    revisor: Mapped[Usuario | None] = relationship(back_populates="eventos_revisados", foreign_keys=[id_revisor], lazy="raise")
    evento_assuntos: Mapped[list[EventoAssunto]] = relationship(back_populates="evento", passive_deletes="all", lazy="raise")
    assuntos: Mapped[list[Assunto]] = relationship(secondary="evento_assunto", back_populates="eventos", viewonly=True, lazy="raise")
    curtidas: Mapped[list[Curtida]] = relationship(back_populates="evento", passive_deletes="all", lazy="raise")
    favoritos: Mapped[list[Favorito]] = relationship(back_populates="evento", passive_deletes="all", lazy="raise")
    comentarios: Mapped[list[Comentario]] = relationship(back_populates="evento", passive_deletes="all", lazy="raise")
