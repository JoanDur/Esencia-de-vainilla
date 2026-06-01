"""
Modelos de Pedido y DetallePedido usando Pydantic.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal
from datetime import datetime


class DetallePedidoIn(BaseModel):
    id_producto: int
    cantidad: int = Field(..., gt=0, description="Cantidad mayor a 0")
    precio_unitario: Decimal = Field(..., gt=0, description="Precio mayor a 0")


class DetallePedidoOut(BaseModel):
    id_producto: int
    nombre_producto: Optional[str] = None
    cantidad: int
    precio_unitario: Decimal
    subtotal: Decimal


class PedidoIn(BaseModel):
    id_usuario: int
    id_direccion: Optional[int] = None
    metodo_pago: Optional[str] = "EFECTIVO"
    detalles: List[DetallePedidoIn] = Field(..., min_length=1)


class PedidoOut(BaseModel):
    id_pedido: int
    fecha: datetime
    estado: str
    total: Decimal
    metodo_pago: Optional[str]
    id_usuario: int
    id_direccion: Optional[int]
    nombre_cliente: Optional[str] = None
    detalles: List[DetallePedidoOut] = []


class CambiarEstadoIn(BaseModel):
    estado: str = Field(..., description="PENDIENTE, CONFIRMADO, EN_CAMINO, ENTREGADO, CANCELADO")