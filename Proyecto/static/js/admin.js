/* =================================================================
   ADMIN.JS — Utilidades compartidas por las paginas de administracion
   - Verifica que el usuario sea ADMIN (id_rol === 1)
   - Construye el sidebar de navegacion
   ================================================================= */

/**
 * Verifica que haya sesion Y que el usuario sea ADMIN.
 * Si no cumple, redirige al login.
 * Devuelve el usuario admin si todo OK.
 */
function requerirAdmin() {
    const data = sessionStorage.getItem('usuario');
    if (!data) {
        window.location.href = '/login.html';
        return null;
    }

    const usuario = JSON.parse(data);

    // id_rol = 1 es ADMIN
    if (usuario.id_rol !== 1) {
        // No es admin: lo mandamos al catalogo
        window.location.href = '/catalogo.html';
        return null;
    }

    return usuario;
}

/**
 * Cierra sesion del admin.
 */
function cerrarSesionAdmin() {
    sessionStorage.removeItem('usuario');
    window.location.href = '/login.html';
}

/**
 * Marca el enlace activo del sidebar segun la pagina actual.
 * Recibe el nombre de la seccion: 'dashboard', 'productos', etc.
 */
function marcarSidebarActivo(seccion) {
    const enlace = document.getElementById('side-' + seccion);
    if (enlace) {
        enlace.classList.add('activo');
    }
}

/**
 * Formatea un numero como precio en pesos colombianos.
 */
function formatearPrecioAdmin(valor) {
    const numero = parseFloat(valor);
    return '$' + numero.toLocaleString('es-CO', { maximumFractionDigits: 0 });
}

/**
 * Formatea un estado de pedido a texto legible.
 */
function formatearEstadoAdmin(estado) {
    const textos = {
        'PENDIENTE':  'Pendiente',
        'CONFIRMADO': 'Confirmado',
        'EN_CAMINO':  'En camino',
        'ENTREGADO':  'Entregado',
        'CANCELADO':  'Cancelado'
    };
    return textos[estado] || estado;
}