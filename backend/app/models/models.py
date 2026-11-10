from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    Table,
    Column,
    Text,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


evento_assunto = Table(
    "evento_assunto",
    Base.metadata,
    Column(
        "id_evento",
        BigInteger,
        ForeignKey("evento.id_evento", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "id_assunto",
        BigInteger,
        ForeignKey("assunto.id_assunto", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class Usuario(Base):
    __tablename__ = "usuario"

    id_user: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    nome: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(254), nullable=False, unique=True)
    senha_hash: Mapped[str] = mapped_column(Text, nullable=False)
    perfil: Mapped[str] = mapped_column(
        String(20), nullable=False, server_default=text("'usuario'")
    )
    telefone: Mapped[str | None] = mapped_column(String(30))
    cidade: Mapped[str | None] = mapped_column(String(120))
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    eventos_sugeridos: Mapped[list[Evento]] = relationship(
        back_populates="sugerido_por", foreign_keys="Evento.id_sugerido_por"
    )
    eventos_revisados: Mapped[list[Evento]] = relationship(
        back_populates="revisor", foreign_keys="Evento.id_revisor"
    )
    comentarios: Mapped[list[Comentario]] = relationship(back_populates="usuario")
    curtidas: Mapped[list[Curtida]] = relationship(back_populates="usuario")
    favoritos: Mapped[list[Favorito]] = relationship(back_populates="usuario")


class Evento(Base):
    __tablename__ = "evento"
    __table_args__ = (
        CheckConstraint("preco IS NULL OR preco >= 0", name="ck_evento_preco_nao_negativo"),
    )

    id_evento: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    titulo: Mapped[str] = mapped_column(String(200), nullable=False)
    descricao: Mapped[str | None] = mapped_column(Text)
    # tipo permanece opcional, conforme database/radarDatabase.sql.
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
    origem: Mapped[str | None] = mapped_column(String(30))
    fonte_externa: Mapped[str | None] = mapped_column(String(100))
    id_externo: Mapped[str | None] = mapped_column(String(200))
    importado_em: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    status_revisao: Mapped[str] = mapped_column(
        String(20), nullable=False, server_default=text("'pendente'")
    )
    contato_sugestao: Mapped[str | None] = mapped_column(String(254))
    id_sugerido_por: Mapped[int | None] = mapped_column(
        ForeignKey("usuario.id_user", ondelete="SET NULL")
    )
    id_revisor: Mapped[int | None] = mapped_column(
        ForeignKey("usuario.id_user", ondelete="SET NULL")
    )
    revisado_em: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    assuntos: Mapped[list[Assunto]] = relationship(
        secondary=evento_assunto, back_populates="eventos"
    )
    sugerido_por: Mapped[Usuario | None] = relationship(
        back_populates="eventos_sugeridos", foreign_keys=[id_sugerido_por]
    )
    revisor: Mapped[Usuario | None] = relationship(
        back_populates="eventos_revisados", foreign_keys=[id_revisor]
    )
    comentarios: Mapped[list[Comentario]] = relationship(back_populates="evento")
    curtidas: Mapped[list[Curtida]] = relationship(back_populates="evento")
    favoritos: Mapped[list[Favorito]] = relationship(back_populates="evento")


class Assunto(Base):
    __tablename__ = "assunto"

    id_assunto: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    nome: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)

    eventos: Mapped[list[Evento]] = relationship(
        secondary=evento_assunto, back_populates="assuntos"
    )


class Curtida(Base):
    __tablename__ = "curtida"

    id_user: Mapped[int] = mapped_column(
        ForeignKey("usuario.id_user", ondelete="CASCADE"), primary_key=True
    )
    id_evento: Mapped[int] = mapped_column(
        ForeignKey("evento.id_evento", ondelete="CASCADE"), primary_key=True
    )
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    usuario: Mapped[Usuario] = relationship(back_populates="curtidas")
    evento: Mapped[Evento] = relationship(back_populates="curtidas")


class Favorito(Base):
    __tablename__ = "favorito"

    id_user: Mapped[int] = mapped_column(
        ForeignKey("usuario.id_user", ondelete="CASCADE"), primary_key=True
    )
    id_evento: Mapped[int] = mapped_column(
        ForeignKey("evento.id_evento", ondelete="CASCADE"), primary_key=True
    )
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    usuario: Mapped[Usuario] = relationship(back_populates="favoritos")
    evento: Mapped[Evento] = relationship(back_populates="favoritos")


class Comentario(Base):
    __tablename__ = "comentario"

    id_comentario: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    id_user: Mapped[int] = mapped_column(
        ForeignKey("usuario.id_user", ondelete="CASCADE"), nullable=False
    )
    id_evento: Mapped[int] = mapped_column(
        ForeignKey("evento.id_evento", ondelete="CASCADE"), nullable=False
    )
    texto: Mapped[str] = mapped_column(Text, nullable=False)
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    usuario: Mapped[Usuario] = relationship(back_populates="comentarios")
    evento: Mapped[Evento] = relationship(back_populates="comentarios")
