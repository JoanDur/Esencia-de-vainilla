/* =================================================================
   MIS-PEDIDOS.JS — Logica del historial de pedidos del cliente
   - Carga los pedidos del usuario (GET /api/pedidos/usuario/{id})
   - Al expandir un pedido, carga sus detalles (GET /api/pedidos/{id})
   ================================================================= */

let usuario = null;

// Cache de detalles ya cargados (para no pedirlos de nuevo cada vez que se expande)
const detallesCache = {};


// ---------- INICIALIZACION ----------
window.addEventListener('DOMContentLoaded', () => {
    usuario = requerirSesion();
    if (!usuario) return;

    configurarNavbar();
    actualizarContadorCarrito();
    cargarPedidos();
});


// ---------- NAVBAR ----------
function configurarNavbar() {
    document.getElementById('saludo-usuario').textContent = 'Hola, ' + usuario.nombre;
    if (usuario.id_rol === 1) {
        document.getElementById('link-admin').classList.remove('oculto');
    }
    document.getElementById('btn-cerrar-sesion').addEventListener('click', cerrarSesion);
}


// ---------- CARGAR PEDIDOS ----------
async function cargarPedidos() {
    const lista = document.getElementById('lista-pedidos');
    const sinPedidos = document.getElementById('sin-pedidos');

    try {
        const respuesta = await fetch(`/api/pedidos/usuario/${usuario.id_usuario}`);
        const pedidos = await respuesta.json();

        // Si no hay pedidos
        if (pedidos.length === 0) {
            lista.classList.add('oculto');
            sinPedidos.classList.remove('oculto');
            return;
        }

        // Renderizar cada pedido
        lista.innerHTML = '';
        pedidos.forEach(pedido => {
            lista.appendChild(crearTarjetaPedido(pedido));
        });

    } catch (error) {
        console.error('Error al cargar pedidos:', error);
        lista.innerHTML = '<p class="cargando-texto">Error al cargar los pedidos</p>';
    }
}


// ---------- CREAR TARJETA DE PEDIDO ----------
function crearTarjetaPedido(pedido) {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-pedido';

    // Formatear la fecha
    const fecha = new Date(pedido.fecha);
    const fechaTexto = fecha.toLocaleDateString('es-CO', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    // Badge de estado (color segun el estado)
    const estadoClase = 'badge-' + pedido.estado.toLowerCase();
    const estadoTexto = formatearEstado(pedido.estado);

    tarjeta.innerHTML = `
        <div class="pedido-cabecera">
            <div class="pedido-info-izq">
                <span class="pedido-numero">Pedido #${pedido.id_pedido}</span>
                <span class="pedido-fecha">${fechaTexto}</span>
            </div>
            <div class="pedido-info-der">
                <span class="badge-estado ${estadoClase}">${estadoTexto}</span>
                <span class="pedido-total">${formatearPrecio(pedido.total)}</span>
                <span class="pedido-flecha">▼</span>
            </div>
        </div>
        <div class="pedido-detalle">
            <div class="detalle-contenido" id="detalle-${pedido.id_pedido}">
                <p class="cargando-texto">Cargando detalle...</p>
            </div>
        </div>
    `;

    // Evento de click para expandir/contraer
    const cabecera = tarjeta.querySelector('.pedido-cabecera');
    cabecera.addEventListener('click', () => toggleDetalle(tarjeta, pedido.id_pedido));

    return tarjeta;
}


// ---------- EXPANDIR/CONTRAER DETALLE ----------
async function toggleDetalle(tarjeta, idPedido) {
    const estaExpandido = tarjeta.classList.contains('expandido');

    // Contraer si ya estaba abierto
    if (estaExpandido) {
        tarjeta.classList.remove('expandido');
        return;
    }

    // Expandir
    tarjeta.classList.add('expandido');

    // Si ya cargamos el detalle antes, no lo pedimos de nuevo
    if (detallesCache[idPedido]) {
        return;
    }

    // Cargar el detalle desde la API
    try {
        const respuesta = await fetch(`/api/pedidos/${idPedido}`);
        const pedido = await respuesta.json();

        detallesCache[idPedido] = pedido;
        renderizarDetalle(idPedido, pedido);

    } catch (error) {
        console.error('Error al cargar detalle:', error);
        document.getElementById(`detalle-${idPedido}`).innerHTML =
            '<p>Error al cargar el detalle</p>';
    }
}


// ---------- RENDERIZAR DETALLE ----------
function renderizarDetalle(idPedido, pedido) {
    const contenedor = document.getElementById(`detalle-${idPedido}`);

    let html = '<div class="detalle-titulo">Productos</div>';

    pedido.detalles.forEach(item => {
        const subtotal = item.precio_unitario * item.cantidad;
        html += `
            <div class="detalle-item">
                <div>
                    <span class="detalle-item-nombre">${item.nombre_producto}</span>
                    <span class="detalle-item-cantidad"> × ${item.cantidad}</span>
                </div>
                <span>${formatearPrecio(subtotal)}</span>
            </div>
        `;
    });

    // Metodo de pago
    html += `
        <div class="detalle-metodo-pago">
            Método de pago: <strong>${pedido.metodo_pago || 'No especificado'}</strong>
        </div>
    `;

    contenedor.innerHTML = html;
}


// ---------- FORMATEAR ESTADO ----------
function formatearEstado(estado) {
    const textos = {
        'PENDIENTE':  'Pendiente',
        'CONFIRMADO': 'Confirmado',
        'EN_CAMINO':  'En camino',
        'ENTREGADO':  'Entregado',
        'CANCELADO':  'Cancelado'
    };
    return textos[estado] || estado;
}
