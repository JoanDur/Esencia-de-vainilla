"""
Repository de Categoría.
Contiene todas las queries SQL puras hacia la tabla CATEGORIA.
"""

from typing import List, Optional
from app.database import get_connection


def listar_todas() -> List[dict]:
    """Devuelve todas las categorías ordenadas por nombre."""
    sql = """
        SELECT id_categoria, nombre, descripcion, imagen_url
        FROM CATEGORIA
        ORDER BY nombre
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
            return cur.fetchall()


def buscar_por_id(id_categoria: int) -> Optional[dict]:
    """Busca una categoría por id. Devuelve None si no existe."""
    sql = """
        SELECT id_categoria, nombre, descripcion, imagen_url
        FROM CATEGORIA
        WHERE id_categoria = %s
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (id_categoria,))
            return cur.fetchone()


def insertar(nombre: str, descripcion: Optional[str], imagen_url: Optional[str]) -> int:
    """Inserta una categoría nueva. Devuelve el nuevo id_categoria."""
    sql = """
        INSERT INTO CATEGORIA (nombre, descripcion, imagen_url)
        VALUES (%s, %s, %s)
        RETURNING id_categoria
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (nombre, descripcion, imagen_url))
            nuevo_id = cur.fetchone()["id_categoria"]
            conn.commit()
            return nuevo_id


def actualizar(id_categoria: int, nombre: str,
               descripcion: Optional[str], imagen_url: Optional[str]) -> int:
    """Actualiza una categoría. Devuelve filas afectadas."""
    sql = """
        UPDATE CATEGORIA
        SET nombre = %s,
            descripcion = %s,
            imagen_url = %s
        WHERE id_categoria = %s
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (nombre, descripcion, imagen_url, id_categoria))
            filas = cur.rowcount
            conn.commit()
            return filas


def eliminar(id_categoria: int) -> int:
    """Elimina una categoría. Devuelve filas afectadas."""
    sql = "DELETE FROM CATEGORIA WHERE id_categoria = %s"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (id_categoria,))
            filas = cur.rowcount
            conn.commit()
            return filas


def contar_productos(id_categoria: int) -> int:
    """Cuenta cuántos productos pertenecen a una categoría."""
    sql = "SELECT COUNT(*) AS total FROM PRODUCTO WHERE id_categoria = %s"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (id_categoria,))
            return cur.fetchone()["total"]