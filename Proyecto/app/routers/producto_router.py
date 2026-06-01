"""
Router de Producto.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List

from app.models.producto import ProductoIn, ProductoOut
from app.repositories import producto_repo, categoria_repo


router = APIRouter(
    prefix="/productos",
    tags=["Productos"]
)


@router.get("", response_model=List[ProductoOut])
def listar_productos(
    incluir_inactivos: bool = Query(False, description="Si True, incluye productos no disponibles")
):
    return producto_repo.listar_todos(solo_disponibles=not incluir_inactivos)


@router.get("/{id_producto}", response_model=ProductoOut)
def obtener_producto(id_producto: int):
    prod = producto_repo.buscar_por_id(id_producto)
    if prod is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return prod


@router.get("/categoria/{id_categoria}", response_model=List[ProductoOut])
def listar_por_categoria(id_categoria: int):
    if categoria_repo.buscar_por_id(id_categoria) is None:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return producto_repo.listar_por_categoria(id_categoria, solo_disponibles=True)


@router.post("", response_model=ProductoOut, status_code=201)
def crear_producto(prod: ProductoIn):
    if prod.id_categoria is not None:
        if categoria_repo.buscar_por_id(prod.id_categoria) is None:
            raise HTTPException(status_code=400, detail=f"La categoría {prod.id_categoria} no existe")
    nuevo_id = producto_repo.insertar(
        prod.nombre, prod.descripcion, prod.precio, prod.stock,
        prod.imagen_url, prod.disponible, prod.id_categoria
    )
    return producto_repo.buscar_por_id(nuevo_id)


@router.put("/{id_producto}", response_model=ProductoOut)
def actualizar_producto(id_producto: int, prod: ProductoIn):
    if producto_repo.buscar_por_id(id_producto) is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    if prod.id_categoria is not None:
        if categoria_repo.buscar_por_id(prod.id_categoria) is None:
            raise HTTPException(status_code=400, detail=f"La categoría {prod.id_categoria} no existe")
    producto_repo.actualizar(
        id_producto, prod.nombre, prod.descripcion, prod.precio, prod.stock,
        prod.imagen_url, prod.disponible, prod.id_categoria
    )
    return producto_repo.buscar_por_id(id_producto)


@router.delete("/{id_producto}")
def desactivar_producto(id_producto: int):
    if producto_repo.buscar_por_id(id_producto) is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    producto_repo.cambiar_disponibilidad(id_producto, False)
    return {"mensaje": "Producto desactivado correctamente"}


@router.patch("/{id_producto}/activar")
def activar_producto(id_producto: int):
    if producto_repo.buscar_por_id(id_producto) is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    producto_repo.cambiar_disponibilidad(id_producto, True)
    return {"mensaje": "Producto activado correctamente"}