"""
Router de Categoría.
Define los endpoints HTTP. Equivalente al @RestController de Spring.
"""

from fastapi import APIRouter, HTTPException
from typing import List

from app.models.categoria import CategoriaIn, CategoriaOut
from app.repositories import categoria_repo


# Crear el router con prefijo /categorias
router = APIRouter(
    prefix="/categorias",
    tags=["Categorías"]
)


@router.get("", response_model=List[CategoriaOut])
def listar_categorias():
    return categoria_repo.listar_todas()


@router.get("/{id_categoria}", response_model=CategoriaOut)
def obtener_categoria(id_categoria: int):
    cat = categoria_repo.buscar_por_id(id_categoria)
    if cat is None:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return cat


@router.post("", response_model=CategoriaOut, status_code=201)
def crear_categoria(cat: CategoriaIn):
    if not cat.nombre or not cat.nombre.strip():
        raise HTTPException(status_code=400, detail="El nombre es obligatorio")
    nuevo_id = categoria_repo.insertar(cat.nombre, cat.descripcion, cat.imagen_url)
    return categoria_repo.buscar_por_id(nuevo_id)


@router.put("/{id_categoria}", response_model=CategoriaOut)
def actualizar_categoria(id_categoria: int, cat: CategoriaIn):
    if categoria_repo.buscar_por_id(id_categoria) is None:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    categoria_repo.actualizar(id_categoria, cat.nombre, cat.descripcion, cat.imagen_url)
    return categoria_repo.buscar_por_id(id_categoria)


@router.delete("/{id_categoria}")
def eliminar_categoria(id_categoria: int):
    if categoria_repo.buscar_por_id(id_categoria) is None:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    productos_afectados = categoria_repo.contar_productos(id_categoria)
    categoria_repo.eliminar(id_categoria)
    return {
        "mensaje": "Categoría eliminada correctamente",
        "productos_sin_categoria": productos_afectados
    }