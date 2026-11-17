"""Adiciona imagem opcional para oportunidades.

Revision ID: 0002
Revises: 0001
"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("evento", sa.Column("url_imagem", sa.Text(), nullable=True))


def downgrade():
    op.drop_column("evento", "url_imagem")
