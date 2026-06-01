"""
Modelo de Categoría usando Pydantic.
Pydantic valida automáticamente los datos que llegan del frontend.
"""

from pydantic import BaseModel
from typing import Optional


class CategoriaIn(BaseModel):
    """
    Modelo para datos que llegan del frontend (POST/PUT).
    No incluye id_categoria porque la BD lo genera automáticamente.
    """
    nombre: str
    descripcion: Optional[str] = None
    imagen_url: Optional[str] = None


class CategoriaOut(BaseModel):
    """
    Modelo para datos que el backend devuelve al frontend.
    Sí incluye id_categoria porque ya está creado.
    """
    id_categoria: int
    nombre: str
    descripcion: Optional[str] = None
    imagen_url: Optional[str] = None