"""
Router de Pedido.
"""

from fastapi import APIRouter, HTTPException
from typing import List

from app.models.pedido import PedidoIn, PedidoOut, CambiarEstadoIn
from app.repositories import pedido_repo, producto_repo


router = APIRouter(
    prefix="/pedidos",
    tags=["Pedidos"]
)


@router.get("", response_model=List[PedidoOut])
def listar_pedidos():
    """GET /pedidos — Lista todos los pedidos (vista admin)."""
    pedidos = pedido_repo.listar_todos()
    return pedidos


@router.get("/usuario/{id_usuario}", response_model=List[PedidoOut])
def listar_pedidos_usuario(id_usuario: int):
    """GET /pedidos/usuario/{id} — Historial de pedidos de un cliente."""
    return pedido_repo.listar_por_usuario(id_usuario)


@router.get("/{id_pedido}", response_model=PedidoOut)
def obtener_pedido(id_pedido: int):
    """GET /pedidos/{id} — Obtiene un pedido completo con sus detalles."""
    pedido = pedido_repo.buscar_por_id(id_pedido)
    if pedido is None:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    pedido["detalles"] = pedido_repo.obtener_detalles(id_pedido)
    return pedido


@router.post("", response_model=PedidoOut, status_code=201)
def crear_pedido(pedido: PedidoIn):
    """POST /pedidos — Crea un nuevo pedido con sus detalles."""
    for d in pedido.detalles:
        prod = producto_repo.buscar_por_id(d.id_producto)
        if prod is None:
            raise HTTPException(
                status_code=400,
                detail=f"El producto {d.id_producto} no existe"
            )
        if not prod["disponible"]:
            raise HTTPException(
                status_code=400,
                detail=f"El producto '{prod['nombre']}' no está disponible"
            )

    detalles_dict = [
        {
            "id_producto": d.id_producto,
            "cantidad": d.cantidad,
            "precio_unitario": d.precio_unitario
        }
        for d in pedido.detalles
    ]

    try:
        id_pedido = pedido_repo.crear_pedido_con_detalles(
            pedido.id_usuario,
            pedido.id_direccion,
            pedido.metodo_pago,
            detalles_dict
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear pedido: {str(e)}")

    pedido_creado = pedido_repo.buscar_por_id(id_pedido)
    pedido_creado["detalles"] = pedido_repo.obtener_detalles(id_pedido)
    return pedido_creado


@router.put("/{id_pedido}/estado", response_model=PedidoOut)
def cambiar_estado_pedido(id_pedido: int, data: CambiarEstadoIn):
    """PUT /pedidos/{id}/estado — Cambia el estado de un pedido."""
    if data.estado not in pedido_repo.ESTADOS_VALIDOS:
        raise HTTPException(
            status_code=400,
            detail=f"Estado inválido. Debe ser uno de: {pedido_repo.ESTADOS_VALIDOS}"
        )

    if pedido_repo.buscar_por_id(id_pedido) is None:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    pedido_repo.actualizar_estado(id_pedido, data.estado)
    pedido_actualizado = pedido_repo.buscar_por_id(id_pedido)
    pedido_actualizado["detalles"] = pedido_repo.obtener_detalles(id_pedido)
    return pedido_actualizado