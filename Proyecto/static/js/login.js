/* =================================================================
   LOGIN.JS — Logica de inicio de sesion
   - Envia el formulario a POST /api/usuarios/login
   - Si el login es exitoso, guarda los datos en sessionStorage
   - Redirige al catalogo (cliente) o al dashboard (admin)
   ================================================================= */

// Si el usuario ya esta logueado, redirigir directamente
window.addEventListener('DOMContentLoaded', () => {
    const usuarioExistente = sessionStorage.getItem('usuario');
    if (usuarioExistente) {
        const u = JSON.parse(usuarioExistente);
        // id_rol = 1 es ADMIN, los demas van al catalogo
        if (u.id_rol === 1) {
            window.location.href = '/admin-dashboard.html';
        } else {
            window.location.href = '/catalogo.html';
        }
    }
});


// Manejar el envio del formulario
const formLogin = document.getElementById('form-login');
const mensajeDiv = document.getElementById('mensaje');
const btnLogin = document.getElementById('btn-login');

formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Tomar valores del formulario
    const correo = document.getElementById('correo').value.trim();
    const contrasena = document.getElementById('contrasena').value;

    // Limpiar mensaje previo
    ocultarMensaje();

    // Deshabilitar el boton mientras se procesa
    btnLogin.disabled = true;
    btnLogin.textContent = 'Iniciando...';

    try {
        const respuesta = await fetch('/api/usuarios/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, contrasena })
        });

        if (!respuesta.ok) {
            // Error 401, 400, etc.
            const error = await respuesta.json();
            mostrarMensaje(error.detail || 'Error al iniciar sesion', 'error');
            return;
        }

        // Login exitoso: guardar el usuario en sessionStorage
        const usuario = await respuesta.json();
        sessionStorage.setItem('usuario', JSON.stringify(usuario));

        mostrarMensaje('¡Bienvenido(a), ' + usuario.nombre + '!', 'exito');

        // Pequena pausa para que el usuario vea el mensaje
        setTimeout(() => {
            // Redirigir segun el rol
            if (usuario.id_rol === 1) {
                window.location.href = '/admin-dashboard.html';
            } else {
                window.location.href = '/catalogo.html';
            }
        }, 800);

    } catch (error) {
        // Error de red o servidor caido
        console.error('Error de red:', error);
        mostrarMensaje('No se pudo conectar al servidor. Intenta de nuevo.', 'error');
    } finally {
        btnLogin.disabled = false;
        btnLogin.textContent = 'Entrar';
    }
});


// Funciones auxiliares para mostrar mensajes
function mostrarMensaje(texto, tipo) {
    mensajeDiv.textContent = texto;
    mensajeDiv.className = 'mensaje visible ' + tipo;
}

function ocultarMensaje() {
    mensajeDiv.className = 'mensaje';
    mensajeDiv.textContent = '';
}