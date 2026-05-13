// ============================================
// Script del panel de administración
// Conecta con la API para mostrar datos reales
// ============================================

// Al cargar la página, traemos los datos
document.addEventListener('DOMContentLoaded', () => {
    cargarUsuarios();
});

// ============================================
// Cargar todos los usuarios desde la API
// ============================================
async function cargarUsuarios() {
    try {
        const respuesta = await fetch('/api/usuarios');
        const usuarios = await respuesta.json();

        if (!respuesta.ok) {
            mostrarError('No se pudieron cargar los usuarios');
            return;
        }

        // Separar clientes y admins
        const clientes = usuarios.filter(u => u.rol === 'cliente');
        const admins = usuarios.filter(u => u.rol === 'admin');

        // Actualizar estadísticas
        document.getElementById('statClientes').textContent = clientes.length;
        document.getElementById('statAdmins').textContent = admins.length;
        document.getElementById('statTotal').textContent = usuarios.length;

        // Mostrar la lista en la tabla
        mostrarTablaClientes(clientes);

    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        mostrarError('Error de conexión con el servidor');
    }
}

// ============================================
// Pinta la tabla de clientes en el HTML
// ============================================
function mostrarTablaClientes(clientes) {
    const tbody = document.getElementById('tablaClientesBody');
    tbody.innerHTML = '';

    if (clientes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding:30px; color:#999;">
                    No hay clientes registrados todavía
                </td>
            </tr>
        `;
        return;
    }

    clientes.forEach(cliente => {
        const fecha = new Date(cliente.creado_en).toLocaleDateString('es-CL');
        const inicial = cliente.nombre.charAt(0).toUpperCase();

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>
                <div class="cliente-celda">
                    <div class="cliente-avatar">${inicial}</div>
                    <span>${cliente.nombre}</span>
                </div>
            </td>
            <td>${cliente.correo}</td>
            <td><span class="badge badge-cliente">Cliente</span></td>
            <td>${fecha}</td>
            <td>
                <button class="btn-eliminar" onclick="eliminarCliente(${cliente.id}, '${cliente.nombre}')">
                    <i class='bx bx-trash'></i>
                </button>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

// ============================================
// Eliminar un cliente
// ============================================
async function eliminarCliente(id, nombre) {
    const confirmar = confirm(`¿Estás seguro de eliminar a "${nombre}"?`);
    if (!confirmar) return;

    try {
        const respuesta = await fetch(`/api/usuarios/${id}`, {
            method: 'DELETE'
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            alert('Cliente eliminado correctamente');
            cargarUsuarios(); // Recarga la tabla
        } else {
            alert(data.error || 'No se pudo eliminar');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión con el servidor');
    }
}

// ============================================
// Muestra un mensaje de error en la tabla
// ============================================
function mostrarError(mensaje) {
    const tbody = document.getElementById('tablaClientesBody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding:30px; color:#ef4444;">
                    ${mensaje}
                </td>
            </tr>
        `;
    }
}