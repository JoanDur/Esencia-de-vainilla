/* =================================================================
   REGISTRO.JS — Logica de registro de nuevos clientes
   - Envia el formulario a POST /api/usuarios/registro
   - El backend asigna id_rol=2 (CLIENTE) por defecto
   - Si todo va bien, inicia sesion automaticamente y redirige al catalogo
   ================================================================= */

const formRegistro = document.getElementById('form-registro');
const mensajeDiv = document.getElementById('mensaje');
const btnRegistro = document.getElementById('btn-registro');


formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Tomar valores del formulario
    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const contrasena = document.getElementById('contrasena').value;

    // Limpiar mensaje previo
    ocultarMensaje();

    // Deshabilitar el boton mientras se procesa
    btnRegistro.disabled = true;
    btnRegistro.textContent = 'Creando cuenta...';

    try {
        const respuesta = await fetch('/api/usuarios/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre,
                correo,
                contrasena,
                telefono: telefono || null,  // si esta vacio, enviar null
                id_rol: 2  // CLIENTE por defecto
            })
        });

        if (!respuesta.ok) {
            const error = await respuesta.json();
            // Si es un error de validacion de Pydantic, el detalle es un array
            let mensajeError = 'Error al crear cuenta';
            if (typeof error.detail === 'string') {
                mensajeError = error.detail;
            } else if (Array.isArray(error.detail) && error.detail.length > 0) {
                mensajeError = error.detail[0].msg || mensajeError;
            }
            mostrarMensaje(mensajeError, 'error');
            return;
        }

        // Registro exitoso: el backend nos devuelve los datos del usuario
        const usuario = await respuesta.json();
        sessionStorage.setItem('usuario', JSON.stringify(usuario));

        mostrarMensaje('¡Cuenta creada exitosamente! Redirigiendo...', 'exito');

        setTimeout(() => {
            window.location.href = '/catalogo.html';
        }, 1200);

    } catch (error) {
        console.error('Error de red:', error);
        mostrarMensaje('No se pudo conectar al servidor. Intenta de nuevo.', 'error');
    } finally {
        btnRegistro.disabled = false;
        btnRegistro.textContent = 'Crear cuenta';
    }
});


function mostrarMensaje(texto, tipo) {
    mensajeDiv.textContent = texto;
    mensajeDiv.className = 'mensaje visible ' + tipo;
}

function ocultarMensaje() {
    mensajeDiv.className = 'mensaje';
    mensajeDiv.textContent = '';
}