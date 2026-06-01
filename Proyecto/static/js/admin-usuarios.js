/* =================================================================
   ADMIN-USUARIOS.JS — Gestion de usuarios
   - Lista todos los usuarios
   - Activa/desactiva usuarios
   - No permite que el admin se desactive a si mismo
   ================================================================= */

let admin = null;


// ---------- INICIALIZACION ----------
window.addEventListener('DOMContentLoaded', () => {
    admin = requerirAdmin();
    if (!admin) return;

    document.getElementById('sidebar-usuario').textContent = admin.nombre;
    document.getElementById('btn-salir').addEventListener('click', cerrarSesionAdmin);
    marcarSidebarActivo('usuarios');

    cargarUsuarios();
});


// ---------- CARGAR USUARIOS ----------
async function cargarUsuarios() {
    const tbody = document.getElementById('tabla-usuarios');

    try {
        const respuesta = await fetch('/api/usuarios');
        const usuarios = await respuesta.json();

        if (usuarios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="cargando-fila">No hay usuarios</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        usuarios.forEach(usuario => {
            // Badge de estado
            const estadoBadge = usuario.activo
                ? '<span class="badge-estado badge-entregado">Activo</span>'
                : '<span class="badge-estado badge-cancelado">Inactivo</span>';

            // Badge de rol con color
            const rolBadge = crearBadgeRol(usuario.nombre_rol);

            // El boton de toggle: deshabilitado si es el usuario actual
            const esUsuarioActual = usuario.id_usuario === admin.id_usuario;
            let botonAccion;
            if (esUsuarioActual) {
                botonAccion = '<span style="color: var(--color-marron); font-size: 0.85rem; font-style: italic;">Tu cuenta</span>';
            } else {
                const textoToggle = usuario.activo ? 'Desactivar' : 'Activar';
                botonAccion = `<button class="btn-accion btn-toggle" data-id="${usuario.id_usuario}" data-activo="${usuario.activo}" data-nombre="${usuario.nombre}">${textoToggle}</button>`;
            }

            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td><strong>${usuario.nombre}</strong></td>
                <td>${usuario.correo}</td>
                <td>${usuario.telefono || '—'}</td>
                <td>${rolBadge}</td>
                <td>${estadoBadge}</td>
                <td>${botonAccion}</td>
            `;
            tbody.appendChild(fila);
        });

        // Eventos de los botones toggle
        tbody.querySelectorAll('.btn-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                toggleUsuario(
                    parseInt(btn.dataset.id),
                    btn.dataset.activo === 'true',
                    btn.dataset.nombre
                );
            });
        });

    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="cargando-fila">Error al cargar</td></tr>';
    }
}


// ---------- BADGE DE ROL ----------
function crearBadgeRol(nombreRol) {
    // Colores distintos segun el rol
    const colores = {
        'ADMIN':    'background-color: #e3d5f5; color: #5e3a8c;',
        'VENDEDOR': 'background-color: #d5e8f5; color: #1f5a8c;',
        'CLIENTE':  'background-color: #f5e6d3; color: #70472c;'
    };
    const estilo = colores[nombreRol] || colores['CLIENTE'];
    return `<span class="badge-estado" style="${estilo}">${nombreRol || 'CLIENTE'}</span>`;
}


// ---------- ACTIVAR/DESACTIVAR USUARIO ----------
async function toggleUsuario(idUsuario, estaActivo, nombre) {
    const accion = estaActivo ? 'desactivar' : 'activar';
    if (!confirm(`¿Seguro que deseas ${accion} a "${nombre}"?`)) {
        return;
    }

    try {
        const respuesta = await fetch(`/api/usuarios/${idUsuario}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activo: !estaActivo })
        });

        if (!respuesta.ok) {
            alert('Error al cambiar el estado del usuario');
            return;
        }

        cargarUsuarios();  // recargar la tabla

    } catch (error) {
        console.error('Error de red:', error);
        alert('No se pudo conectar al servidor');
    }
}