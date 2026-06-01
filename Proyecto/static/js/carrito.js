/* =================================================================
   CARRITO.JS — Logica de la pagina del carrito
   - Muestra los items del carrito (localStorage)
   - Permite ajustar cantidades y eliminar
   - Confirma el pedido: POST /api/pedidos
   ================================================================= */

const COSTO_ENVIO = 5000;  // envio fijo

let usuario = null;


// ---------- INICIALIZACION ----------
window.addEventListener('DOMContentLoaded', async () => {
    usuario = requerirSesion();
    if (!usuario) return;

    configurarNavbar();
    await sincronizarCarritoConProductos();
    actualizarContadorCarrito();
    renderizarCarrito();

    // Evento del boton confirmar
    document.getElementById('btn-confirmar').addEventListener('click', confirmarPedido);
});


// ---------- SINCRONIZAR DATOS DEL CARRITO ----------
async function sincronizarCarritoConProductos() {
    const carrito = obtenerCarrito();
    if (carrito.length === 0) return;

    try {
        const respuesta = await fetch('/api/productos');
        if (!respuesta.ok) return;

        const productos = await respuesta.json();
        const productosPorId = new Map(productos.map(prod => [prod.id_producto, prod]));
        let huboCambios = false;

        carrito.forEach(item => {
            const productoActual = productosPorId.get(item.id_producto);
            if (!productoActual) return;

            if (item.imagen_url !== productoActual.imagen_url) {
                item.imagen_url = productoActual.imagen_url;
                huboCambios = true;
            }

            if (item.nombre !== productoActual.nombre) {
                item.nombre = productoActual.nombre;
                huboCambios = true;
            }

            if (item.precio !== productoActual.precio) {
                item.precio = productoActual.precio;
                huboCambios = true;
            }
        });

        if (huboCambios) {
            guardarCarrito(carrito);
        }
    } catch (error) {
        console.error('No se pudo sincronizar el carrito:', error);
    }
}


// ---------- NAVBAR ----------
function configurarNavbar() {
    document.getElementById('saludo-usuario').textContent = 'Hola, ' + usuario.nombre;
    if (usuario.id_rol === 1) {
        document.getElementById('link-admin').classList.remove('oculto');
    }
    document.getElementById('btn-cerrar-sesion').addEventListener('click', cerrarSesion);
}


// ---------- RENDERIZAR CARRITO ----------
function renderizarCarrito() {
    const carrito = obtenerCarrito();
    const layout = document.getElementById('carrito-layout');
    const vacio = document.getElementById('carrito-vacio');

    // Si el carrito esta vacio, mostrar el mensaje
    if (carrito.length === 0) {
        layout.classList.add('oculto');
        vacio.classList.remove('oculto');
        return;
    }

    // Hay productos: mostrar el layout
    layout.classList.remove('oculto');
    vacio.classList.add('oculto');

    const lista = document.getElementById('lista-items');
    lista.innerHTML = '';

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        const imagenUrl = item.imagen_url || 'https://placehold.co/90x90/f5e6d3/70472c?text=?';

        const div = document.createElement('div');
        div.className = 'item-carrito';
        div.innerHTML = `
            <img src="${imagenUrl}" alt="${item.nombre}"
                 onerror="this.src='https://placehold.co/90x90/f5e6d3/70472c?text=?'">
            <div class="item-info">
                <h3>${item.nombre}</h3>
                <span class="item-precio-unit">${formatearPrecio(item.precio)} c/u</span>
            </div>
            <div class="item-controles">
                <div class="selector-cantidad">
                    <button class="btn-cantidad" data-accion="restar" data-id="${item.id_producto}">−</button>
                    <span class="cantidad-valor">${item.cantidad}</span>
                    <button class="btn-cantidad" data-accion="sumar" data-id="${item.id_producto}">+</button>
                </div>
                <span class="item-subtotal">${formatearPrecio(subtotal)}</span>
                <button class="btn-eliminar" data-id="${item.id_producto}">Eliminar</button>
            </div>
        `;
        lista.appendChild(div);
    });

    // Eventos de los botones +/-
    lista.querySelectorAll('.btn-cantidad').forEach(boton => {
        boton.addEventListener('click', () => {
            const id = parseInt(boton.dataset.id);
            const accion = boton.dataset.accion;
            cambiarCantidad(id, accion);
        });
    });

    // Eventos de los botones eliminar
    lista.querySelectorAll('.btn-eliminar').forEach(boton => {
        boton.addEventListener('click', () => {
            const id = parseInt(boton.dataset.id);
            eliminarItem(id);
        });
    });

    // Actualizar el resumen (subtotal, total)
    actualizarResumen();
}


// ---------- CAMBIAR CANTIDAD ----------
function cambiarCantidad(idProducto, accion) {
    const carrito = obtenerCarrito();
    const item = carrito.find(i => i.id_producto === idProducto);
    if (!item) return;

    if (accion === 'sumar') {
        item.cantidad += 1;
    } else if (accion === 'restar') {
        item.cantidad -= 1;
        // Si llega a 0, eliminar el item
        if (item.cantidad <= 0) {
            const idx = carrito.indexOf(item);
            carrito.splice(idx, 1);
        }
    }

    guardarCarrito(carrito);
    actualizarContadorCarrito();
    renderizarCarrito();
}


// ---------- ELIMINAR ITEM ----------
function eliminarItem(idProducto) {
    let carrito = obtenerCarrito();
    carrito = carrito.filter(i => i.id_producto !== idProducto);
    guardarCarrito(carrito);
    actualizarContadorCarrito();
    renderizarCarrito();
}


// ---------- ACTUALIZAR RESUMEN ----------
function actualizarResumen() {
    const carrito = obtenerCarrito();
    const subtotal = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const total = subtotal + COSTO_ENVIO;

    document.getElementById('resumen-subtotal').textContent = formatearPrecio(subtotal);
    document.getElementById('resumen-envio').textContent = formatearPrecio(COSTO_ENVIO);
    document.getElementById('resumen-total').textContent = formatearPrecio(total);
}


// ---------- CONFIRMAR PEDIDO ----------
async function confirmarPedido() {
    const carrito = obtenerCarrito();
    if (carrito.length === 0) return;

    const btnConfirmar = document.getElementById('btn-confirmar');
    const metodoPago = document.getElementById('metodo-pago').value;

    btnConfirmar.disabled = true;
    btnConfirmar.textContent = 'Procesando...';
    ocultarMensaje();

    // Armar el cuerpo del pedido segun lo que espera la API
    const detalles = carrito.map(item => ({
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario: item.precio
    }));

    const cuerpoPedido = {
        id_usuario: usuario.id_usuario,
        id_direccion: null,       // no manejamos direcciones por ahora
        metodo_pago: metodoPago,
        detalles: detalles
    };

    try {
        const respuesta = await fetch('/api/pedidos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cuerpoPedido)
        });

        if (!respuesta.ok) {
            const error = await respuesta.json();
            let msg = 'Error al confirmar el pedido';
            if (typeof error.detail === 'string') msg = error.detail;
            mostrarMensaje(msg, 'error');
            return;
        }

        // Pedido creado con exito
        const pedido = await respuesta.json();

        // Vaciar el carrito
        localStorage.removeItem('carrito');
        actualizarContadorCarrito();

        mostrarMensaje('¡Pedido confirmado! Redirigiendo...', 'exito');

        setTimeout(() => {
            window.location.href = '/mis-pedidos.html';
        }, 1200);

    } catch (error) {
        console.error('Error de red:', error);
        mostrarMensaje('No se pudo conectar al servidor', 'error');
    } finally {
        btnConfirmar.disabled = false;
        btnConfirmar.textContent = 'Confirmar pedido';
    }
}


// ---------- MENSAJES ----------
function mostrarMensaje(texto, tipo) {
    const div = document.getElementById('mensaje');
    div.textContent = texto;
    div.className = 'mensaje visible ' + tipo;
}

function ocultarMensaje() {
    const div = document.getElementById('mensaje');
    div.className = 'mensaje';
}
