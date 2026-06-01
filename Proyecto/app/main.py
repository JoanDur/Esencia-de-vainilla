"""
Punto de entrada de la aplicación FastAPI.
"""

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.database import test_connection
from app.routers import (
    categoria_router,
    producto_router,
    pedido_router,
    usuario_router,
)

app = FastAPI(
    title="Esencia Vainilla API",
    description="Backend de la tienda de postres Esencia Vainilla",
    version="1.0.0"
)


@app.on_event("startup")
def startup_event():
    print("\n" + "=" * 50)
    print("Iniciando Esencia Vainilla API")
    print("=" * 50)
    test_connection()
    print("=" * 50 + "\n")


@app.get("/api/health")
def health_check():
    return {"status": "ok", "mensaje": "API funcionando correctamente"}


# Registrar los routers de la API
app.include_router(categoria_router.router, prefix="/api")
app.include_router(producto_router.router, prefix="/api")
app.include_router(pedido_router.router, prefix="/api")
app.include_router(usuario_router.router, prefix="/api")

# Servir archivos estáticos — debe ir al FINAL
app.mount("/", StaticFiles(directory="static", html=True), name="static")
