/* =================================================================
   ADMIN-PRODUCTOS.JS — Gestion de productos (CRUD con modal)
   ================================================================= */

let admin = null;
let categorias = [];


// ---------- INICIALIZACION ----------
window.addEventListener('DOMContentLoaded', () => {
    admin = requerirAdmin();
    if (!admin) return;

    document.getElementById('sidebar-usuario').textContent = admin.nombre;
    document.getElementById('btn-salir').addEventListener('click', cerrarSesionAdmin);
    marcarSidebarActivo('productos');

    // Eventos del modal
    document.getElementById('btn-nuevo').addEventListener('click', abrirModalNuevo);
    document.getElementById('modal-cerrar').addEventListener('click', cerrarModal);
    document.getElementById('modal-cancelar').addEventListener('click', cerrarModal);
    document.getElementById('form-producto').addEventListener('submit', guardarProducto);

    // Cargar datos
    cargarCategorias();
    cargarProductos();
});


// ---------- CARGAR CATEGORIAS (para el select) ----------
async function cargarCategorias() {
    try {
        const respuesta = await fetch('/api/categorias');
        categorias = await respuesta.json();

        const select = document.getElementById('prod-categoria');
        // Limpiar opciones excepto la primera ("Sin categoria")
        select.innerHTML = '<option value="">Sin categoría</option>';
        categorias.forEach(cat => {
            const opcion = document.createElement('option');
            opcion.value = cat.id_categoria;
            opcion.textContent = cat.nombre;
            select.appendChild(opcion);
        });
    } catch (error) {
        console.error('Error al cargar categorias:', error);
    }
}


// ---------- CARGAR PRODUCTOS (tabla) ----------
async function cargarProductos() {
    const tbody = document.getElementById('tabla-productos');

    try {
        // incluir_inactivos=true para ver TODOS (vista admin)
        const respuesta = await fetch('/api/productos?incluir_inactivos=true');
        const productos = await respuesta.json();

        if (productos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="cargando-fila">No hay productos</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        productos.forEach(prod => {
            const imagenUrl = prod.imagen_url || 'https://placehold.co/50x50/f5e6d3/70472c?text=?';
            const estadoBadge = prod.disponible
                ? '<span class="badge-estado badge-entregado">Activo</span>'
                : '<span class="badge-estado badge-cancelado">Inactivo</span>';
            const textoToggle = prod.disponible ? 'Desactivar' : 'Activar';

            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td><img src="${imagenUrl}" class="miniatura" onerror="this.src='https://placehold.co/50x50/f5e6d3/70472c?text=?'"></td>
                <td><strong>${prod.nombre}</strong></td>
                <td>${prod.categoria_nombre || '—'}</td>
                <td>${formatearPrecioAdmin(prod.precio)}</td>
                <td>${prod.stock}</td>
                <td>${estadoBadge}</td>
                <td>
                    <button class="btn-accion btn-editar" data-id="${prod.id_producto}">Editar</button>
                    <button class="btn-accion btn-toggle" data-id="${prod.id_producto}" data-disponible="${prod.disponible}">${textoToggle}</button>
                </td>
            `;
            tbody.appendChild(fila);
        });

        // Eventos de los botones
        tbody.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', () => abrirModalEditar(parseInt(btn.dataset.id)));
        });
        tbody.querySelectorAll('.btn-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const disponible = btn.dataset.disponible === 'true';
                toggleDisponibilidad(id, disponible);
            });
        });

    } catch (error) {
        console.error('Error al cargar productos:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="cargando-fila">Error al cargar</td></tr>';
    }
}


// ---------- ABRIR MODAL: NUEVO ----------
function abrirModalNuevo() {
    document.getElementById('modal-titulo').textContent = 'Nuevo producto';
    document.getElementById('form-producto').reset();
    document.getElementById('prod-id').value = '';
    document.getElementById('prod-disponible').checked = true;
    ocultarMensajeModal();
    mostrarModal();
}


// ---------- ABRIR MODAL: EDITAR ----------
async function abrirModalEditar(idProducto) {
    try {
        const respuesta = await fetch(`/api/productos/${idProducto}`);
        const prod = await respuesta.json();

        document.getElementById('modal-titulo').textContent = 'Editar producto';
        document.getElementById('prod-id').value = prod.id_producto;
        document.getElementById('prod-nombre').value = prod.nombre;
        document.getElementById('prod-descripcion').value = prod.descripcion || '';
        document.getElementById('prod-precio').value = prod.precio;
        document.getElementById('prod-stock').value = prod.stock;
        document.getElementById('prod-categoria').value = prod.id_categoria || '';
        document.getElementById('prod-imagen').value = prod.imagen_url || '';
        document.getElementById('prod-disponible').checked = prod.disponible;

        ocultarMensajeModal();
        mostrarModal();
    } catch (error) {
        console.error('Error al cargar producto:', error);
    }
}


// ---------- GUARDAR PRODUCTO (crear o actualizar) ----------
async function guardarProducto(e) {
    e.preventDefault();

    const id = document.getElementById('prod-id').value;
    const categoriaValor = document.getElementById('prod-categoria').value;

    const datos = {
        nombre: document.getElementById('prod-nombre').value.trim(),
        descripcion: document.getElementById('prod-descripcion').value.trim() || null,
        precio: parseFloat(document.getElementById('prod-precio').value),
        stock: parseInt(document.getElementById('prod-stock').value) || 0,
        imagen_url: document.getElementById('prod-imagen').value.trim() || null,
        disponible: document.getElementById('prod-disponible').checked,
        id_categoria: categoriaValor ? parseInt(categoriaValor) : null
    };

    const btnGuardar = document.getElementById('btn-guardar');
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    try {
        let respuesta;
        if (id) {
            // Editar (PUT)
            respuesta = await fetch(`/api/productos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
        } else {
            // Crear (POST)
            respuesta = await fetch('/api/productos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
        }

        if (!respuesta.ok) {
            const error = await respuesta.json();
            let msg = 'Error al guardar';
            if (typeof error.detail === 'string') msg = error.detail;
            else if (Array.isArray(error.detail)) msg = error.detail[0].msg;
            mostrarMensajeModal(msg, 'error');
            return;
        }

        cerrarModal();
        cargarProductos();  // recargar la tabla

    } catch (error) {
        console.error('Error de red:', error);
        mostrarMensajeModal('No se pudo conectar al servidor', 'error');
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.textContent = 'Guardar';
    }
}


// ---------- ACTIVAR/DESACTIVAR ----------
async function toggleDisponibilidad(idProducto, estaDisponible) {
    const accion = estaDisponible ? 'desactivar' : 'activar';
    if (!confirm(`¿Seguro que deseas ${accion} este producto?`)) {
        return;
    }

    try {
        let respuesta;
        if (estaDisponible) {
            // Desactivar (DELETE = borrado logico)
            respuesta = await fetch(`/api/productos/${idProducto}`, { method: 'DELETE' });
        } else {
            // Activar (PATCH)
            respuesta = await fetch(`/api/productos/${idProducto}/activar`, { method: 'PATCH' });
        }

        if (!respuesta.ok) {
            alert('Error al cambiar el estado del producto');
            return;
        }

        cargarProductos();  // recargar

    } catch (error) {
        console.error('Error de red:', error);
        alert('No se pudo conectar al servidor');
    }
}


// ---------- UTILIDADES DEL MODAL ----------
function mostrarModal() {
    document.getElementById('modal-overlay').classList.remove('oculto');
}

function cerrarModal() {
    document.getElementById('modal-overlay').classList.add('oculto');
}

function mostrarMensajeModal(texto, tipo) {
    const div = document.getElementById('modal-mensaje');
    div.textContent = texto;
    div.className = 'mensaje visible ' + tipo;
}

function ocultarMensajeModal() {
    document.getElementById('modal-mensaje').className = 'mensaje';
}