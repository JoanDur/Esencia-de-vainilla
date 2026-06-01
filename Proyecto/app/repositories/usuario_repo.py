"""
Repository de Usuario.
"""

from typing import List, Optional
from app.database import get_connection


SQL_SELECT_BASE = """
    SELECT u.id_usuario,
           u.nombre,
           u.correo,
           u.contrasena,
           u.telefono,
           u.fecha_registro,
           u.activo,
           u.id_rol,
           r.nombre AS nombre_rol
    FROM USUARIO u
    JOIN ROL r ON u.id_rol = r.id_rol
"""


def listar_todos() -> List[dict]:
    sql = SQL_SELECT_BASE + " ORDER BY u.fecha_registro DESC"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
            return cur.fetchall()


def buscar_por_id(id_usuario: int) -> Optional[dict]:
    sql = SQL_SELECT_BASE + " WHERE u.id_usuario = %s"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (id_usuario,))
            return cur.fetchone()


def buscar_por_correo(correo: str) -> Optional[dict]:
    sql = SQL_SELECT_BASE + " WHERE u.correo = %s"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (correo,))
            return cur.fetchone()


def insertar(nombre: str, correo: str, contrasena: str,
             telefono: Optional[str], id_rol: int) -> int:
    sql = """
        INSERT INTO USUARIO (nombre, correo, contrasena, telefono, id_rol)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id_usuario
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (nombre, correo, contrasena, telefono, id_rol))
            nuevo_id = cur.fetchone()["id_usuario"]
            conn.commit()
            return nuevo_id


def cambiar_estado(id_usuario: int, activo: bool) -> int:
    sql = "UPDATE USUARIO SET activo = %s WHERE id_usuario = %s"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (activo, id_usuario))
            filas = cur.rowcount
            conn.commit()
            return filas


def verificar_credenciales(correo: str, contrasena: str) -> Optional[dict]:
    sql = SQL_SELECT_BASE + " WHERE u.correo = %s AND u.contrasena = %s AND u.activo = TRUE"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (correo, contrasena))
            return cur.fetchone()


def contar_todos() -> int:
    sql = "SELECT COUNT(*) AS total FROM USUARIO WHERE activo = TRUE"
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
            return cur.fetchone()["total"]