"""
Repository de Pedido.
"""

from typing import List, Optional
from decimal import Decimal
from app.database import get_connection


ESTADOS_VALIDOS = ['PENDIENTE', 'CONFIRMADO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO']


def listar_todos() -> List[dict]:
    sql = """
        SELECT p.id_pedido, p.fecha, p.estado, p.total, p.metodo_pago,
               p.id_usuario, p.id_direccion, u.nombre AS nombre_cliente
        FROM PEDIDO p
        JOIN USUARIO u ON p.id_usuario = u.id_usuario
        ORDER BY p.fecha DESC
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
            return cur.fetchall()


def listar_por_usuario(id_usuario: int) -> List[dict]:
    sql = """
        SELECT p.id_pedido, p.fecha, p.estado, p.total, p.metodo_pago,
               p.id_usuario, p.id_direccion, u.nombre AS nombre_cliente
        FROM PEDIDO p
        JOIN USUARIO u ON p.id_usuario = u.id_usuario
        WHERE p.id_usuario = %s
        ORDER BY p.fecha DESC
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (id_usuario,))
            return cur.fetchall()


def buscar_por_id(id_pedido: int) -> Optional[dict]:
    sql = """
        SELECT p.id_pedido, p.fecha, p.estado, p.total, p.metodo_pago,
               p.id_usuario, p.id_direccion, u.nombre AS nombre_cliente
        FROM PEDIDO p
        JOIN USUARIO u ON p.id_usuario = u.id_usuario
        WHERE p.id_pedido = %s
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (id_pedido,))
            return cur.fetchone()


def obtener_detalles(id_pedido: int) -> List[dict]:
    sql = """
        SELECT dp.id_producto, pr.nombre AS nombre_producto,
               dp.cantidad, dp.precio_unitario, dp.subtotal
        FROM DETALLE_PEDIDO dp
        JOIN PRODUCTO pr ON dp.id_producto = pr.id_producto
        WHERE dp.id_pedido = %s
        ORDER BY pr.nombre
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (id_pedido,))
            return cur.fetchall()


def crear_pedido_con_detalles(id_usuario, id_direccion, metodo_pago, detalles) -> int:
    total = Decimal("0")
    for d in detalles:
        subtotal = Decimal(str(d["cantidad"])) * Decimal(str(d["precio_unitario"]))
        d["subtotal"] = subtotal
        total += subtotal

    sql_pedido = """
        INSERT INTO PEDIDO (id_usuario, id_direccion, metodo_pago, total, estado)
        VALUES (%s, %s, %s, %s, 'PENDIENTE')
        RETURNING id_pedido
    """
    sql_detalle = """
        INSERT INTO DETALLE_PEDIDO (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
        VALUES (%s, %s, %s, %s, %s)
    """

    with get_connection() as conn:
        try:
            with conn.cursor() as cur:
                cur.execute(sql_pedido, (id_usuario, id_direccion, metodo_pago, total))
                id_pedido = cur.fetchone()["id_pedido"]

                for d in detalles:
                    cur.execute(sql_detalle, (
                        id_pedido,
                        d["id_producto"],
                        d["cantidad"],
                        d["precio_unitario"],
                        d["subtotal"]
                    ))

                conn.commit()
                return id_pedido

        except Exception as e:
            conn.rollback()
            raise e


def actualizar_estado(id_pedido: int, nuevo_estado: str) -> int:
    sql = "UPDATE PEDIDO SET estado = %s WHERE id_pedido = %s"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (nuevo_estado, id_pedido))
            filas = cur.rowcount
            conn.commit()
            return filas


def contar_por_estado(estado: str) -> int:
    sql = "SELECT COUNT(*) AS total FROM PEDIDO WHERE estado = %s"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (estado,))
            return cur.fetchone()["total"]