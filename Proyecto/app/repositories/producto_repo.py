"""
Repository de Producto.
"""

from typing import List, Optional
from decimal import Decimal
from app.database import get_connection


SQL_SELECT_BASE = """
    SELECT p.id_producto,
           p.nombre,
           p.descripcion,
           p.precio,
           p.stock,
           p.imagen_url,
           p.disponible,
           p.id_categoria,
           c.nombre AS categoria_nombre
    FROM PRODUCTO p
    LEFT JOIN CATEGORIA c ON p.id_categoria = c.id_categoria
"""


def listar_todos(solo_disponibles: bool = True) -> List[dict]:
    sql = SQL_SELECT_BASE
    if solo_disponibles:
        sql += " WHERE p.disponible = TRUE"
    sql += " ORDER BY p.nombre"

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
            return cur.fetchall()


def buscar_por_id(id_producto: int) -> Optional[dict]:
    sql = SQL_SELECT_BASE + " WHERE p.id_producto = %s"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (id_producto,))
            return cur.fetchone()


def listar_por_categoria(id_categoria: int, solo_disponibles: bool = True) -> List[dict]:
    sql = SQL_SELECT_BASE + " WHERE p.id_categoria = %s"
    if solo_disponibles:
        sql += " AND p.disponible = TRUE"
    sql += " ORDER BY p.nombre"

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (id_categoria,))
            return cur.fetchall()


def insertar(nombre: str, descripcion: Optional[str], precio: Decimal,
             stock: int, imagen_url: Optional[str], disponible: bool,
             id_categoria: Optional[int]) -> int:
    sql = """
        INSERT INTO PRODUCTO
            (nombre, descripcion, precio, stock, imagen_url, disponible, id_categoria)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id_producto
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (nombre, descripcion, precio, stock,
                              imagen_url, disponible, id_categoria))
            nuevo_id = cur.fetchone()["id_producto"]
            conn.commit()
            return nuevo_id


def actualizar(id_producto: int, nombre: str, descripcion: Optional[str],
               precio: Decimal, stock: int, imagen_url: Optional[str],
               disponible: bool, id_categoria: Optional[int]) -> int:
    sql = """
        UPDATE PRODUCTO
        SET nombre       = %s,
            descripcion  = %s,
            precio       = %s,
            stock        = %s,
            imagen_url   = %s,
            disponible   = %s,
            id_categoria = %s
        WHERE id_producto = %s
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (nombre, descripcion, precio, stock, imagen_url,
                              disponible, id_categoria, id_producto))
            filas = cur.rowcount
            conn.commit()
            return filas


def cambiar_disponibilidad(id_producto: int, disponible: bool) -> int:
    sql = "UPDATE PRODUCTO SET disponible = %s WHERE id_producto = %s"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (disponible, id_producto))
            filas = cur.rowcount
            conn.commit()
            return filas