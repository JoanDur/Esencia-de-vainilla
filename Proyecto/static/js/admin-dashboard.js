/* =================================================================
   ADMIN-DASHBOARD.JS — Logica del dashboard de administracion
   - Carga las estadisticas (productos, categorias, pedidos, usuarios)
   - Muestra los 5 pedidos mas recientes
   ================================================================= */

let admin = null;


// ---------- INICIALIZACION ----------
window.addEventListener('DOMContentLoaded', () => {
    // Verificar que sea admin
    admin = requerirAdmin();
    if (!admin) return;

    // Configurar sidebar
    document.getElementById('sidebar-usuario').textContent = admin.nombre;
    document.getElementById('btn-salir').addEventListener('click', cerrarSesionAdmin);
    marcarSidebarActivo('dashboard');

    // Cargar datos
    cargarEstadisticas();
    cargarPedidosRecientes();
});


// ---------- CARGAR ESTADISTICAS ----------
async function cargarEstadisticas() {
    try {
        // Productos activos (la API ya devuelve solo disponibles por defecto)
        const resProductos = await fetch('/api/productos');
        const productos = await resProductos.json();
        document.getElementById('num-productos').textContent = productos.length;

        // Categorias
        const resCategorias = await fetch('/api/categorias');
        const categorias = await resCategorias.json();
        document.getElementById('num-categorias').textContent = categorias.length;

        // Usuarios
        const resUsuarios = await fetch('/api/usuarios');
        const usuarios = await resUsuarios.json();
        document.getElementById('num-usuarios').textContent = usuarios.length;

        // Pedidos pendientes (filtramos de todos los pedidos)
        const resPedidos = await fetch('/api/pedidos');
        const pedidos = await resPedidos.json();
        const pendientes = pedidos.filter(p => p.estado === 'PENDIENTE').length;
        document.getElementById('num-pendientes').textContent = pendientes;

    } catch (error) {
        console.error('Error al cargar estadisticas:', error);
    }
}


// ---------- CARGAR PEDIDOS RECIENTES ----------
async function cargarPedidosRecientes() {
    const tbody = document.getElementById('tabla-pedidos-recientes');

    try {
        const respuesta = await fetch('/api/pedidos');
        const pedidos = await respuesta.json();

        if (pedidos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="cargando-fila">No hay pedidos aún</td></tr>';
            return;
        }

        // Tomar los primeros 5 (ya vienen ordenados por fecha DESC)
        const recientes = pedidos.slice(0, 5);

        tbody.innerHTML = '';
        recientes.forEach(pedido => {
            const fecha = new Date(pedido.fecha).toLocaleDateString('es-CO', {
                day: 'numeric', month: 'short', year: 'numeric'
            });
            const estadoClase = 'badge-' + pedido.estado.toLowerCase();
            const estadoTexto = formatearEstadoAdmin(pedido.estado);

            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td><strong>#${pedido.id_pedido}</strong></td>
                <td>${pedido.nombre_cliente}</td>
                <td>${fecha}</td>
                <td><span class="badge-estado ${estadoClase}">${estadoTexto}</span></td>
                <td><strong>${formatearPrecioAdmin(pedido.total)}</strong></td>
            `;
            tbody.appendChild(fila);
        });

    } catch (error) {
        console.error('Error al cargar pedidos recientes:', error);
        tbody.innerHTML = '<tr><td colspan="5" class="cargando-fila">Error al cargar</td></tr>';
    }
}