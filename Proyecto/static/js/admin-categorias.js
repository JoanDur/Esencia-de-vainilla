/* =================================================================
   ADMIN-CATEGORIAS.JS — Gestion de categorias (CRUD con modal)
   ================================================================= */

let admin = null;
let conteoProductos = {};  // {id_categoria: cantidad}


// ---------- INICIALIZACION ----------
window.addEventListener('DOMContentLoaded', () => {
    admin = requerirAdmin();
    if (!admin) return;

    document.getElementById('sidebar-usuario').textContent = admin.nombre;
    document.getElementById('btn-salir').addEventListener('click', cerrarSesionAdmin);
    marcarSidebarActivo('categorias');

    // Eventos del modal
    document.getElementById('btn-nuevo').addEventListener('click', abrirModalNuevo);
    document.getElementById('modal-cerrar').addEventListener('click', cerrarModal);
    document.getElementById('modal-cancelar').addEventListener('click', cerrarModal);
    document.getElementById('form-categoria').addEventListener('submit', guardarCategoria);

    cargarTodo();
});


// ---------- CARGAR TODO (categorias + conteo de productos) ----------
async function cargarTodo() {
    try {
        // Primero cargar productos para contar cuantos hay por categoria
        const resProductos = await fetch('/api/productos?incluir_inactivos=true');
        const productos = await resProductos.json();

        // Calcular el conteo por categoria
        conteoProductos = {};
        productos.forEach(p => {
            if (p.id_categoria) {
                conteoProductos[p.id_categoria] = (conteoProductos[p.id_categoria] || 0) + 1;
            }
        });

        // Ahora cargar las categorias
        cargarCategorias();

    } catch (error) {
        console.error('Error al cargar datos:', error);
    }
}


// ---------- CARGAR CATEGORIAS (tabla) ----------
async function cargarCategorias() {
    const tbody = document.getElementById('tabla-categorias');

    try {
        const respuesta = await fetch('/api/categorias');
        const categorias = await respuesta.json();

        if (categorias.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="cargando-fila">No hay categorías</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        categorias.forEach(cat => {
            const cantidad = conteoProductos[cat.id_categoria] || 0;

            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td><strong>${cat.nombre}</strong></td>
                <td>${cat.descripcion || '—'}</td>
                <td>${cantidad} producto(s)</td>
                <td>
                    <button class="btn-accion btn-editar" data-id="${cat.id_categoria}">Editar</button>
                    <button class="btn-accion btn-eliminar-tabla" data-id="${cat.id_categoria}" data-nombre="${cat.nombre}" data-productos="${cantidad}">Eliminar</button>
                </td>
            `;
            tbody.appendChild(fila);
        });

        // Eventos
        tbody.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', () => abrirModalEditar(parseInt(btn.dataset.id)));
        });
        tbody.querySelectorAll('.btn-eliminar-tabla').forEach(btn => {
            btn.addEventListener('click', () => {
                eliminarCategoria(
                    parseInt(btn.dataset.id),
                    btn.dataset.nombre,
                    parseInt(btn.dataset.productos)
                );
            });
        });

    } catch (error) {
        console.error('Error al cargar categorias:', error);
        tbody.innerHTML = '<tr><td colspan="4" class="cargando-fila">Error al cargar</td></tr>';
    }
}


// ---------- ABRIR MODAL: NUEVO ----------
function abrirModalNuevo() {
    document.getElementById('modal-titulo').textContent = 'Nueva categoría';
    document.getElementById('form-categoria').reset();
    document.getElementById('cat-id').value = '';
    ocultarMensajeModal();
    mostrarModal();
}


// ---------- ABRIR MODAL: EDITAR ----------
async function abrirModalEditar(idCategoria) {
    try {
        const respuesta = await fetch(`/api/categorias/${idCategoria}`);
        const cat = await respuesta.json();

        document.getElementById('modal-titulo').textContent = 'Editar categoría';
        document.getElementById('cat-id').value = cat.id_categoria;
        document.getElementById('cat-nombre').value = cat.nombre;
        document.getElementById('cat-descripcion').value = cat.descripcion || '';
        document.getElementById('cat-imagen').value = cat.imagen_url || '';

        ocultarMensajeModal();
        mostrarModal();
    } catch (error) {
        console.error('Error al cargar categoria:', error);
    }
}


// ---------- GUARDAR CATEGORIA ----------
async function guardarCategoria(e) {
    e.preventDefault();

    const id = document.getElementById('cat-id').value;
    const datos = {
        nombre: document.getElementById('cat-nombre').value.trim(),
        descripcion: document.getElementById('cat-descripcion').value.trim() || null,
        imagen_url: document.getElementById('cat-imagen').value.trim() || null
    };

    const btnGuardar = document.getElementById('btn-guardar');
    btnGuardar.disabled = true;
    btnGuardar.textContent = 'Guardando...';

    try {
        let respuesta;
        if (id) {
            respuesta = await fetch(`/api/categorias/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
        } else {
            respuesta = await fetch('/api/categorias', {
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
        cargarTodo();

    } catch (error) {
        console.error('Error de red:', error);
        mostrarMensajeModal('No se pudo conectar al servidor', 'error');
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.textContent = 'Guardar';
    }
}


// ---------- ELIMINAR CATEGORIA ----------
async function eliminarCategoria(idCategoria, nombre, cantidadProductos) {
    let mensaje = `¿Seguro que deseas eliminar la categoría "${nombre}"?`;
    if (cantidadProductos > 0) {
        mensaje += `\n\nAtención: ${cantidadProductos} producto(s) quedarán sin categoría (no se eliminarán).`;
    }

    if (!confirm(mensaje)) {
        return;
    }

    try {
        const respuesta = await fetch(`/api/categorias/${idCategoria}`, { method: 'DELETE' });

        if (!respuesta.ok) {
            alert('Error al eliminar la categoría');
            return;
        }

        cargarTodo();

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