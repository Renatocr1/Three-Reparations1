// ============================================
// Cambio entre login y registro (animación)
// ============================================
const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});

// ============================================
// REGISTRO de usuario
// ============================================
const formRegistro = document.getElementById('formRegistro');
const mensajeRegistro = document.getElementById('mensajeRegistro');

formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que el formulario recargue la página

    const nombre = document.getElementById('regNombre').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;

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
            // Después de 1.5 seg cambia al panel de login
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
// LOGIN de usuario
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
            mensajeLogin.textContent = '¡Bienvenido ' + data.usuario.nombre + '!';

            // Guarda el usuario en sessionStorage para usarlo en admin.html
            sessionStorage.setItem('usuario', JSON.stringify(data.usuario));

            // Redirige al panel de administración
            setTimeout(() => {
                window.location.href = 'admin.html';
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