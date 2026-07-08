// ============================================
// 1. Cambio entre login y registro (animación)
// ============================================
const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

// Activa el panel de registro
registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});

// Activa el panel de login
loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});

// ============================================
// 2. REGISTRO de usuario 
// ============================================
const formRegistro = document.getElementById('formRegistro');
const mensajeRegistro = document.getElementById('mensajeRegistro');

formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('regNombre').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;

    // --- NUEVA VALIDACIÓN ---
    if (password.includes(' ')) {
        mensajeRegistro.style.color = 'red';
        mensajeRegistro.textContent = 'La contraseña no puede contener espacios.';
        return; // Detenemos la ejecución aquí si hay espacios
    }
    // ------------------------

    try {
        const respuesta = await fetch('/api/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password })
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            mensajeRegistro.style.color = 'green';
            mensajeRegistro.textContent = data.mensaje || 'Registrado correctamente';
            formRegistro.reset();

            setTimeout(() => {
                container.classList.remove('active');
                mensajeRegistro.textContent = '';
            }, 1500);
        } else {
            mensajeRegistro.style.color = 'red';
            mensajeRegistro.textContent = data.error || 'Error al registrar';
        }
    } catch (error) {
        console.error('Error:', error);
        mensajeRegistro.style.color = 'red';
        mensajeRegistro.textContent = 'No se pudo conectar con el servidor';
    }
});

// ============================================
// 3. LOGIN de usuario (CON REDIRECCIÓN POR ROL)
// ============================================
const formLogin = document.getElementById('formLogin');
const mensajeLogin = document.getElementById('mensajeLogin');

formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
        const respuesta = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            mensajeLogin.style.color = 'green';
            mensajeLogin.textContent = `¡Bienvenido ${data.usuario.nombre}!`;

            // Guardamos los datos en sessionStorage para usarlos en otras páginas
            sessionStorage.setItem('usuario', JSON.stringify(data.usuario));

            // REDIRECCIÓN SEGÚN EL ROL RECIBIDO DEL BACKEND (admin o cliente)
            setTimeout(() => {
                if (data.usuario.rol === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'cliente.html';
                }
            }, 1000);
        } else {
            mensajeLogin.style.color = 'red';
            mensajeLogin.textContent = data.error || 'Credenciales inválidas';
        }
    } catch (error) {
        console.error('Error:', error);
        mensajeLogin.style.color = 'red';
        mensajeLogin.textContent = 'No se pudo conectar con el servidor';
    }
});