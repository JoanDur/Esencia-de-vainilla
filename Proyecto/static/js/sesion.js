/* =================================================================
   SESION.JS — Utilidades compartidas por las paginas del cliente
   Maneja: verificacion de sesion, logout, y el carrito (localStorage)
   ================================================================= */

// ---------- SESION ----------

/**
 * Obtiene el usuario logueado desde sessionStorage.
 * Devuelve null si no hay sesion.
 */
function obtenerUsuario() {
    const data = sessionStorage.getItem('usuario');
    return data ? JSON.parse(data) : null;
}

/**
 * Verifica que haya una sesion activa. Si no, redirige al login.
 * Se llama al inicio de cada pagina protegida.
 * Devuelve el usuario si esta logueado.
 */
function requerirSesion() {
    const usuario = obtenerUsuario();
    if (!usuario) {
        window.location.href = '/login.html';
        return null;
    }
    return usuario;
}

/**
 * Cierra la sesion: borra sessionStorage y redirige al login.
 * El carrito (localStorage) NO se borra, para que se conserve.
 */
function cerrarSesion() {
    sessionStorage.removeItem('usuario');
    window.location.href = '/login.html';
}


// ---------- CARRITO (localStorage) ----------

/**
 * Obtiene el carrito desde localStorage.
 * Devuelve un array de objetos {id_producto, nombre, precio, cantidad, imagen_url}.
 */
function obtenerCarrito() {
    const data = localStorage.getItem('carrito');
    return data ? JSON.parse(data) : [];
}

/**
 * Guarda el carrito en localStorage.
 */
function guardarCarrito(carrito) {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

/**
 * Agrega un producto al carrito.
 * Si ya existe, aumenta la cantidad. Si no, lo agrega nuevo.
 */
function agregarAlCarrito(producto) {
    const carrito = obtenerCarrito();
    const existente = carrito.find(item => item.id_producto === producto.id_producto);

    if (existente) {
        existente.cantidad += 1;
        existente.nombre = producto.nombre;
        existente.precio = producto.precio;
        existente.imagen_url = producto.imagen_url;
    } else {
        carrito.push({
            id_producto: producto.id_producto,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1,
            imagen_url: producto.imagen_url
        });
    }

    guardarCarrito(carrito);
    return carrito;
}

/**
 * Cuenta el total de items en el carrito (sumando cantidades).
 * Sirve para el contador del navbar.
 */
function contarItemsCarrito() {
    const carrito = obtenerCarrito();
    return carrito.reduce((total, item) => total + item.cantidad, 0);
}

/**
 * Actualiza el numero del contador del carrito en el navbar.
 * Busca un elemento con id 'contador-carrito'.
 */
function actualizarContadorCarrito() {
    const contador = document.getElementById('contador-carrito');
    if (contador) {
        const total = contarItemsCarrito();
        contador.textContent = total;
        // Ocultar el contador si esta en 0
        contador.style.display = total > 0 ? 'flex' : 'none';
    }
}


// ---------- FORMATO ----------

/**
 * Formatea un numero como precio en pesos colombianos.
 * Ejemplo: 65000 -> "$65.000"
 */
function formatearPrecio(valor) {
    const numero = parseFloat(valor);
    return '$' + numero.toLocaleString('es-CO', { maximumFractionDigits: 0 });
}
