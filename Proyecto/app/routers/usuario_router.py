"""
Router de Usuario.
"""

from fastapi import APIRouter, HTTPException
from typing import List

from app.models.usuario import (
    RegistroIn, LoginIn, LoginOut, UsuarioOut, CambiarEstadoUsuarioIn
)
from app.repositories import usuario_repo


router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)


@router.post("/registro", response_model=LoginOut, status_code=201)
def registrar_usuario(data: RegistroIn):
    existente = usuario_repo.buscar_por_correo(data.correo)
    if existente is not None:
        raise HTTPException(status_code=400, detail="Ya existe un usuario con ese correo")

    try:
        nuevo_id = usuario_repo.insertar(
            data.nombre, data.correo, data.contrasena,
            data.telefono, data.id_rol
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al registrar usuario: {str(e)}")

    usuario = usuario_repo.buscar_por_id(nuevo_id)
    return LoginOut(
        id_usuario=usuario["id_usuario"],
        nombre=usuario["nombre"],
        correo=usuario["correo"],
        id_rol=usuario["id_rol"],
        nombre_rol=usuario["nombre_rol"]
    )


@router.post("/login", response_model=LoginOut)
def login(data: LoginIn):
    usuario = usuario_repo.verificar_credenciales(data.correo, data.contrasena)
    if usuario is None:
        raise HTTPException(
            status_code=401,
            detail="Correo o contraseña incorrectos (o cuenta desactivada)"
        )
    return LoginOut(
        id_usuario=usuario["id_usuario"],
        nombre=usuario["nombre"],
        correo=usuario["correo"],
        id_rol=usuario["id_rol"],
        nombre_rol=usuario["nombre_rol"]
    )


@router.get("", response_model=List[UsuarioOut])
def listar_usuarios():
    return usuario_repo.listar_todos()


@router.get("/{id_usuario}", response_model=UsuarioOut)
def obtener_usuario(id_usuario: int):
    usuario = usuario_repo.buscar_por_id(id_usuario)
    if usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


@router.put("/{id_usuario}/estado", response_model=UsuarioOut)
def cambiar_estado_usuario(id_usuario: int, data: CambiarEstadoUsuarioIn):
    if usuario_repo.buscar_por_id(id_usuario) is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    usuario_repo.cambiar_estado(id_usuario, data.activo)
    return usuario_repo.buscar_por_id(id_usuario)