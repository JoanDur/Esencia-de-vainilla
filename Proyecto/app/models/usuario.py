"""
Modelos de Usuario usando Pydantic.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class RegistroIn(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=50)
    correo: str = Field(..., max_length=100)
    contrasena: str = Field(..., min_length=4, max_length=255)
    telefono: Optional[str] = Field(None, max_length=10)
    id_rol: int = 2  # 2 = CLIENTE por defecto


class LoginIn(BaseModel):
    correo: str
    contrasena: str


class LoginOut(BaseModel):
    id_usuario: int
    nombre: str
    correo: str
    id_rol: int
    nombre_rol: Optional[str] = None


class UsuarioOut(BaseModel):
    id_usuario: int
    nombre: str
    correo: str
    telefono: Optional[str]
    fecha_registro: datetime
    activo: bool
    id_rol: int
    nombre_rol: Optional[str] = None


class CambiarEstadoUsuarioIn(BaseModel):
    activo: bool