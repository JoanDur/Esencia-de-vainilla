/* =================================================================
   ADMIN-PEDIDOS.JS — Gestion de pedidos
   - Lista todos los pedidos
   - Filtra por estado
   - Cambia el estado desde la tabla (PUT)
   - Muestra el detalle en un modal
   ================================================================= */

let admin = null;
let todosLosPedidos = [];
let filtroActivo = 'todos';

// Estados disponibles para el select
const ESTADOS = ['PENDIENTE', 'CONFIRMADO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'];


// ---------- INICIALIZACION ----------
window.addEventListener('DOMContentLoaded', () => {
    admin = requerirAdmin();
    if (!admin) return;

    document.getElementById('sidebar-usuario').textContent = admin.nombre;
    document.getElementById('btn-salir').addEventListener('click', cerrarSesionAdmin);
    marcarSidebarActivo('pedidos');

    // Eventos de los filtros
    document.querySelectorAll('.pill-estado').forEach(btn => {
        btn.addEventListener('click', () => filtrarPorEstado(btn.dataset.estado, btn));
    });

    // Eventos del modal
    document.getElementById('modal-cerrar').addEventListener('click', cerrarModal);
    document.getElementById('modal-cerrar-2').addEventListener('click', cerrarModal);

    cargarPedidos();
});


// ---------- CARGAR PEDIDOS ----------
async function cargarPedidos() {
    const tbody = document.getElementById('tabla-pedidos');

    try {
        const respuesta = await fetch('/api/pedidos');
        todosLosPedidos = await respuesta.json();

        renderizarPedidos(todosLosPedidos);

    } catch (error) {
        console.error('Error al cargar pedidos:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="cargando-fila">Error al cargar</td></tr>';
    }
}


// ---------- RENDERIZAR PEDIDOS ----------
function renderizarPedidos(pedidos) {
    const tbody = document.getElementById('tabla-pedidos');

    if (pedidos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="cargando-fila">No hay pedidos con este estado</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    pedidos.forEach(pedido => {
        const fecha = new Date(pedido.fecha).toLocaleDateString('es-CO', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        // Construir las opciones del select de estado
        let opcionesEstado = '';
        ESTADOS.forEach(est => {
            const seleccionado = est === pedido.estado ? 'selected' : '';
            opcionesEstado += `<option value="${est}" ${seleccionado}>${formatearEstadoAdmin(est)}</option>`;
        });

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td><strong>#${pedido.id_pedido}</strong></td>
            <td>${pedido.nombre_cliente}</td>
            <td>${fecha}</td>
            <td><strong>${formatearPrecioAdmin(pedido.total)}</strong></td>
            <td>
                <select class="select-estado" data-id="${pedido.id_pedido}">
                    ${opcionesEstado}
                </select>
            </td>
            <td>
                <button class="btn-accion btn-editar" data-id="${pedido.id_pedido}">Ver detalle</button>
            </td>
        `;
        tbody.appendChild(fila);
    });

    // Eventos: cambiar estado
    tbody.querySelectorAll('.select-estado').forEach(select => {
        select.addEventListener('change', () => {
            cambiarEstado(parseInt(select.dataset.id), select.value);
        });
    });

    // Eventos: ver detalle
    tbody.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', () => verDetalle(parseInt(btn.dataset.id)));
    });
}


// ---------- FILTRAR POR ESTADO ----------
function filtrarPorEstado(estado, boton) {
    filtroActivo = estado;

    document.querySelectorAll('.pill-estado').forEach(b => b.classList.remove('activo'));
    boton.classList.add('activo');

    if (estado === 'todos') {
        renderizarPedidos(todosLosPedidos);
    } else {
        const filtrados = todosLosPedidos.filter(p => p.estado === estado);
        renderizarPedidos(filtrados);
    }
}


// ---------- CAMBIAR ESTADO ----------
async function cambiarEstado(idPedido, nuevoEstado) {
    try {
        const respuesta = await fetch(`/api/pedidos/${idPedido}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });

        if (!respuesta.ok) {
            alert('Error al cambiar el estado del pedido');
            cargarPedidos();  // recargar para revertir el select
            return;
        }

        // Actualizar el pedido en nuestra lista local (sin recargar todo)
        const pedido = todosLosPedidos.find(p => p.id_pedido === idPedido);
        if (pedido) {
            pedido.estado = nuevoEstado;
        }

        // Si hay un filtro activo distinto de "todos", re-renderizar para que
        // el pedido desaparezca/aparezca segun el filtro
        if (filtroActivo !== 'todos') {
            const botonActivo = document.querySelector('.pill-estado.activo');
            filtrarPorEstado(filtroActivo, botonActivo);
        }

    } catch (error) {
        console.error('Error de red:', error);
        alert('No se pudo conectar al servidor');
        cargarPedidos();
    }
}


// ---------- VER DETALLE (modal) ----------
async function verDetalle(idPedido) {
    const contenido = document.getElementById('modal-detalle-contenido');
    contenido.innerHTML = '<p class="cargando-fila">Cargando detalle...</p>';

    document.getElementById('modal-titulo').textContent = `Detalle del pedido #${idPedido}`;
    mostrarModal();

    try {
        const respuesta = await fetch(`/api/pedidos/${idPedido}`);
        const pedido = await respuesta.json();

        const fecha = new Date(pedido.fecha).toLocaleDateString('es-CO', {
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        let html = `
            <div class="detalle-modal-info">
                <p><strong>Cliente:</strong> ${pedido.nombre_cliente}</p>
                <p><strong>Fecha:</strong> ${fecha}</p>
                <p><strong>Estado:</strong> ${formatearEstadoAdmin(pedido.estado)}</p>
                <p><strong>Método de pago:</strong> ${pedido.metodo_pago || 'No especificado'}</p>
            </div>
            <h3 style="margin-bottom: 10px; font-size: 1.1rem;">Productos</h3>
        `;

        pedido.detalles.forEach(item => {
            const subtotal = item.precio_unitario * item.cantidad;
            html += `
                <div class="detalle-modal-item">
                    <span>${item.nombre_producto} × ${item.cantidad}</span>
                    <span>${formatearPrecioAdmin(subtotal)}</span>
                </div>
            `;
        });

        html += `
            <div class="detalle-modal-total">
                <span>Total</span>
                <span>${formatearPrecioAdmin(pedido.total)}</span>
            </div>
        `;

        contenido.innerHTML = html;

    } catch (error) {
        console.error('Error al cargar detalle:', error);
        contenido.innerHTML = '<p>Error al cargar el detalle</p>';
    }
}


// ---------- UTILIDADES DEL MODAL ----------
function mostrarModal() {
    document.getElementById('modal-overlay').classList.remove('oculto');
}

function cerrarModal() {
    document.getElementById('modal-overlay').classList.add('oculto');
}