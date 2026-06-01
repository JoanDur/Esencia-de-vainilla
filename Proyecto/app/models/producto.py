"""
Modelo de Producto usando Pydantic.
"""

from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal


class ProductoIn(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: Decimal = Field(..., gt=0, description="Precio mayor a 0")
    stock: int = Field(default=0, ge=0, description="Stock mayor o igual a 0")
    imagen_url: Optional[str] = None
    disponible: bool = True
    id_categoria: Optional[int] = None


class ProductoOut(BaseModel):
    id_producto: int
    nombre: str
    descripcion: Optional[str] = None
    precio: Decimal
    stock: int
    imagen_url: Optional[str] = None
    disponible: bool
    id_categoria: Optional[int] = None
    categoria_nombre: Optional[str] = None