/* =================================================================
   CATALOGO.JS — Logica del catalogo de productos
   - Verifica sesion
   - Carga categorias y productos desde la API
   - Filtra por categoria
   - Agrega productos al carrito
   ================================================================= */

// Variables globales
let usuario = null;
let todosLosProductos = [];  // guardamos todos para filtrar sin re-pedir a la API
let categoriaActiva = 'todas';


// ---------- INICIALIZACION ----------
window.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar sesion (si no hay, redirige al login)
    usuario = requerirSesion();
    if (!usuario) return;

    // 2. Configurar el navbar
    configurarNavbar();

    // 3. Actualizar el contador del carrito
    actualizarContadorCarrito();

    // 4. Cargar categorias y productos
    await cargarCategorias();
    await cargarProductos();
});


// ---------- NAVBAR ----------
function configurarNavbar() {
    // Mostrar el saludo
    document.getElementById('saludo-usuario').textContent = 'Hola, ' + usuario.nombre;

    // Mostrar el boton de admin solo si es ADMIN (id_rol = 1)
    if (usuario.id_rol === 1) {
        document.getElementById('link-admin').classList.remove('oculto');
    }

    // Boton cerrar sesion
    document.getElementById('btn-cerrar-sesion').addEventListener('click', cerrarSesion);
}


// ---------- CARGAR CATEGORIAS ----------
async function cargarCategorias() {
    try {
        const respuesta = await fetch('/api/categorias');
        const categorias = await respuesta.json();

        const contenedor = document.getElementById('filtros-categoria');

        // Por cada categoria, crear un boton pill
        categorias.forEach(cat => {
            const boton = document.createElement('button');
            boton.className = 'pill-categoria';
            boton.dataset.categoria = cat.id_categoria;
            boton.textContent = cat.nombre;
            boton.addEventListener('click', () => filtrarPorCategoria(cat.id_categoria, boton));
            contenedor.appendChild(boton);
        });

        // El boton "Todas" ya esta en el HTML; agregarle el evento
        const botonTodas = contenedor.querySelector('[data-categoria="todas"]');
        botonTodas.addEventListener('click', () => filtrarPorCategoria('todas', botonTodas));

    } catch (error) {
        console.error('Error al cargar categorias:', error);
    }
}


// ---------- CARGAR PRODUCTOS ----------
async function cargarProductos() {
    const grid = document.getElementById('grid-productos');

    try {
        const respuesta = await fetch('/api/productos');
        todosLosProductos = await respuesta.json();

        renderizarProductos(todosLosProductos);

    } catch (error) {
        console.error('Error al cargar productos:', error);
        grid.innerHTML = '<p class="sin-productos">Error al cargar los productos</p>';
    }
}


// ---------- RENDERIZAR PRODUCTOS ----------
function renderizarProductos(productos) {
    const grid = document.getElementById('grid-productos');

    // Si no hay productos
    if (productos.length === 0) {
        grid.innerHTML = '<p class="sin-productos">No hay productos en esta categoria</p>';
        return;
    }

    // Limpiar el grid
    grid.innerHTML = '';

    // Crear una tarjeta por cada producto
    productos.forEach(prod => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta-producto';

        // Imagen con fallback si no carga
        const imagenUrl = prod.imagen_url || 'https://placehold.co/300x200/f5e6d3/70472c?text=Sin+Imagen';

        tarjeta.innerHTML = `
            <img src="${imagenUrl}" alt="${prod.nombre}"
                 onerror="this.src='https://placehold.co/300x200/f5e6d3/70472c?text=Sin+Imagen'">
            <div class="tarjeta-cuerpo">
                <span class="tarjeta-categoria">${prod.categoria_nombre || 'Sin categoría'}</span>
                <h3 class="tarjeta-nombre">${prod.nombre}</h3>
                <p class="tarjeta-descripcion">${prod.descripcion || ''}</p>
                <div class="tarjeta-precio">${formatearPrecio(prod.precio)}</div>
                <button class="btn-agregar" data-id="${prod.id_producto}">
                    Agregar al carrito
                </button>
            </div>
        `;

        // Evento del boton agregar
        const boton = tarjeta.querySelector('.btn-agregar');
        boton.addEventListener('click', () => manejarAgregar(prod, boton));

        grid.appendChild(tarjeta);
    });
}


// ---------- FILTRAR POR CATEGORIA ----------
function filtrarPorCategoria(idCategoria, botonClickeado) {
    categoriaActiva = idCategoria;

    // Actualizar el estilo de los botones (quitar 'activo' de todos, ponerlo al clickeado)
    document.querySelectorAll('.pill-categoria').forEach(b => b.classList.remove('activo'));
    botonClickeado.classList.add('activo');

    // Filtrar los productos
    if (idCategoria === 'todas') {
        renderizarProductos(todosLosProductos);
    } else {
        const filtrados = todosLosProductos.filter(p => p.id_categoria === idCategoria);
        renderizarProductos(filtrados);
    }
}


// ---------- Agregar al carrito----------
function manejarAgregar(producto, boton) {
    // Agregar al carrito(funcion de sesion.js)
    agregarAlCarrito(producto);

    // Actualizar el contador del navbar
    actualizarContadorCarrito();

    // Animacion visual en el boton
    boton.classList.add('agregado');
    boton.textContent = 'Agregado';

    setTimeout(() => {
        boton.classList.remove('agregado');
        boton.textContent = 'Agregar al carrito';
    }, 1000);

    // Mostrar toast
    mostrarToast(`${producto.nombre} agregado al carrito`);
}


// ---------- TOAST ----------
let toastTimeout = null;

function mostrarToast(mensaje) {
    const toast = document.getElementById('toast');
    toast.textContent = mensaje;
    toast.classList.add('visible');

    // Limpiar timeout previo si existe
    if (toastTimeout) clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        toast.classList.remove('visible');
    }, 2500);
}

