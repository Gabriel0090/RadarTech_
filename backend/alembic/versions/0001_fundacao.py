"""Fundacao: sete tabelas conforme SQL de referencia, com url_fonte.

Revision ID: 0001
Revises: None
"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('assunto',
    sa.Column('id_assunto', sa.BigInteger(), sa.Identity(always=False), nullable=False),
    sa.Column('nome', sa.String(length=100), nullable=False),
    sa.PrimaryKeyConstraint('id_assunto', name=op.f('pk_assunto')),
    sa.UniqueConstraint('nome', name=op.f('uq_assunto_nome'))
    )
    op.create_table('usuario',
    sa.Column('id_user', sa.BigInteger(), sa.Identity(always=False), nullable=False),
    sa.Column('nome', sa.String(length=120), nullable=False),
    sa.Column('email', sa.String(length=254), nullable=False),
    sa.Column('senha_hash', sa.Text(), nullable=False),
    sa.Column('perfil', sa.String(length=20), server_default=sa.text("'usuario'"), nullable=False),
    sa.Column('telefone', sa.String(length=30), nullable=True),
    sa.Column('cidade', sa.String(length=120), nullable=True),
    sa.Column('criado_em', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id_user', name=op.f('pk_usuario')),
    sa.UniqueConstraint('email', name=op.f('uq_usuario_email'))
    )
    op.create_table('evento',
    sa.Column('id_evento', sa.BigInteger(), sa.Identity(always=False), nullable=False),
    sa.Column('titulo', sa.String(length=200), nullable=False),
    sa.Column('descricao', sa.Text(), nullable=True),
    sa.Column('tipo', sa.String(length=50), nullable=True),
    sa.Column('instituicao', sa.String(length=200), nullable=True),
    sa.Column('publico_alvo', sa.Text(), nullable=True),
    sa.Column('requisitos', sa.Text(), nullable=True),
    sa.Column('nivel', sa.String(length=50), nullable=True),
    sa.Column('modalidade', sa.String(length=20), nullable=True),
    sa.Column('preco', sa.Numeric(precision=12, scale=2), nullable=True),
    sa.Column('cidade', sa.String(length=120), nullable=True),
    sa.Column('estado', sa.String(length=100), nullable=True),
    sa.Column('data_inicio', sa.DateTime(timezone=True), nullable=True),
    sa.Column('data_fim', sa.DateTime(timezone=True), nullable=True),
    sa.Column('prazo_inscricao', sa.DateTime(timezone=True), nullable=True),
    sa.Column('url_inscricao', sa.Text(), nullable=True),
    sa.Column('url_fonte', sa.Text(), nullable=True),
    sa.Column('origem', sa.String(length=30), nullable=True),
    sa.Column('fonte_externa', sa.String(length=100), nullable=True),
    sa.Column('id_externo', sa.String(length=200), nullable=True),
    sa.Column('importado_em', sa.DateTime(timezone=True), nullable=True),
    sa.Column('status_revisao', sa.String(length=20), server_default=sa.text("'pendente'"), nullable=False),
    sa.Column('contato_sugestao', sa.String(length=254), nullable=True),
    sa.Column('id_sugerido_por', sa.BigInteger(), nullable=True),
    sa.Column('id_revisor', sa.BigInteger(), nullable=True),
    sa.Column('revisado_em', sa.DateTime(timezone=True), nullable=True),
    sa.Column('criado_em', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.CheckConstraint('preco IS NULL OR preco >= 0', name=op.f('ck_evento_preco_nao_negativo')),
    sa.ForeignKeyConstraint(['id_revisor'], ['usuario.id_user'], name=op.f('fk_evento_id_revisor_usuario'), ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['id_sugerido_por'], ['usuario.id_user'], name=op.f('fk_evento_id_sugerido_por_usuario'), ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id_evento', name=op.f('pk_evento'))
    )
    op.create_table('comentario',
    sa.Column('id_comentario', sa.BigInteger(), sa.Identity(always=False), nullable=False),
    sa.Column('id_user', sa.BigInteger(), nullable=False),
    sa.Column('id_evento', sa.BigInteger(), nullable=False),
    sa.Column('texto', sa.Text(), nullable=False),
    sa.Column('criado_em', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['id_evento'], ['evento.id_evento'], name=op.f('fk_comentario_id_evento_evento'), ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['id_user'], ['usuario.id_user'], name=op.f('fk_comentario_id_user_usuario'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id_comentario', name=op.f('pk_comentario'))
    )
    op.create_table('curtida',
    sa.Column('id_user', sa.BigInteger(), nullable=False),
    sa.Column('id_evento', sa.BigInteger(), nullable=False),
    sa.Column('criado_em', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['id_evento'], ['evento.id_evento'], name=op.f('fk_curtida_id_evento_evento'), ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['id_user'], ['usuario.id_user'], name=op.f('fk_curtida_id_user_usuario'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id_user', 'id_evento', name=op.f('pk_curtida'))
    )
    op.create_table('evento_assunto',
    sa.Column('id_evento', sa.BigInteger(), nullable=False),
    sa.Column('id_assunto', sa.BigInteger(), nullable=False),
    sa.ForeignKeyConstraint(['id_assunto'], ['assunto.id_assunto'], name=op.f('fk_evento_assunto_id_assunto_assunto'), ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['id_evento'], ['evento.id_evento'], name=op.f('fk_evento_assunto_id_evento_evento'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id_evento', 'id_assunto', name=op.f('pk_evento_assunto'))
    )
    op.create_table('favorito',
    sa.Column('id_user', sa.BigInteger(), nullable=False),
    sa.Column('id_evento', sa.BigInteger(), nullable=False),
    sa.Column('criado_em', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['id_evento'], ['evento.id_evento'], name=op.f('fk_favorito_id_evento_evento'), ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['id_user'], ['usuario.id_user'], name=op.f('fk_favorito_id_user_usuario'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id_user', 'id_evento', name=op.f('pk_favorito'))
    )



def downgrade() -> None:
    op.drop_table('favorito')
    op.drop_table('evento_assunto')
    op.drop_table('curtida')
    op.drop_table('comentario')
    op.drop_table('evento')
    op.drop_table('usuario')
    op.drop_table('assunto')
