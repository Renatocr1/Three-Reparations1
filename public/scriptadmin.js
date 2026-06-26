// ============================================
// Panel de Administración - Lógica de Usuarios
// Archivo: public/scriptadmin.js
// ============================================

const API_URL = 'http://localhost:3000/api';

// Estado global
let todosLosUsuarios = [];
let filtroActual = 'todos'; // 'todos' | 'cliente' | 'admin'

// Referencias al DOM
const tbody = document.getElementById('tablaClientesBody');
const statClientes = document.getElementById('statClientes');
const statAdmins = document.getElementById('statAdmins');
const statTotal = document.getElementById('statTotal');

/**
 * Carga todos los usuarios desde la API y actualiza la tabla y estadísticas.
 */
async function cargarUsuarios() {
  tbody.innerHTML = `
    <tr>
      <td colspan="5" style="text-align:center; padding:30px; color:#999;">
        <i class='bx bx-loader-alt bx-spin'></i> Cargando usuarios...
      </td>
    </tr>`;

  try {
    const res = await fetch(`${API_URL}/usuarios`, {
      method: 'GET',
      credentials: 'include' // Obligatorio para enviar la cookie de sesión
    });
    
    if (!res.ok) throw new Error(`Error ${res.status} al cargar usuarios`);
    todosLosUsuarios = await res.json();

    actualizarEstadisticas();
    renderizarTabla();
  } catch (err) {
    console.error('Error al cargar usuarios:', err);
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:30px; color:#dc2626;">
          <i class='bx bx-error-circle'></i> ${err.message}
        </td>
      </tr>`;
  }
}

/**
 * Actualiza las tres tarjetas de estadísticas con los totales reales.
 */
function actualizarEstadisticas() {
  const clientes = todosLosUsuarios.filter(u => u.rol === 'cliente').length;
  const admins = todosLosUsuarios.filter(u => u.rol === 'admin').length;

  statClientes.textContent = clientes;
  statAdmins.textContent = admins;
  statTotal.textContent = todosLosUsuarios.length;
}

/**
 * Aplica el filtro actual y dibuja las filas de la tabla.
 */
function renderizarTabla() {
  const usuariosFiltrados = filtroActual === 'todos'
    ? todosLosUsuarios
    : todosLosUsuarios.filter(u => u.rol === filtroActual);

  if (usuariosFiltrados.length === 0) {
    const etiqueta = filtroActual === 'todos'
      ? 'usuarios'
      : (filtroActual === 'cliente' ? 'clientes' : 'administradores');

    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:30px; color:#999;">
          <i class='bx bx-info-circle'></i> No hay ${etiqueta} registrados
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = usuariosFiltrados.map(u => `
    <tr data-id="${u.id}">
      <td>${escaparHTML(u.nombre)}</td>
      <td>${escaparHTML(u.correo)}</td>
      <td>
        <span class="badge badge-${u.rol}">
          ${u.rol === 'admin' ? 'Administrador' : 'Cliente'}
        </span>
      </td>
      <td>${formatearFecha(u.creado_en)}</td>
      <td>
        <button class="btn-eliminar" onclick="eliminarUsuario(event, ${u.id}, '${escaparHTML(u.nombre)}')">
          <i class='bx bx-trash'></i> Eliminar
        </button>
      </td>
    </tr>
  `).join('');
}

/**
 * Cambia el filtro activo y vuelve a renderizar la tabla.
 */
function cambiarFiltro(nuevoFiltro) {
  filtroActual = nuevoFiltro;
  document.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filtro === nuevoFiltro);
  });
  renderizarTabla();
}

/**
 * Elimina un usuario tras confirmación.
 */
async function eliminarUsuario(event, id, nombre) {
  const ok = await confirmarAccion({
    titulo: 'Eliminar usuario',
    mensaje: '¿Eliminar al usuario "' + nombre + '"? Esta acción no se puede deshacer.',
    textoConfirmar: 'Eliminar',
    peligro: true
  });
  if (!ok) return;

  const boton = event.currentTarget;
  const fila = boton.closest('tr');

  boton.classList.add('eliminando');
  boton.innerHTML = `<i class='bx bx-loader-alt'></i> Eliminando...`;

  try {
    const res = await fetch(`${API_URL}/usuarios/${id}`, { 
      method: 'DELETE',
      credentials: 'include' // Obligatorio para enviar la cookie de sesión
    });
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Error ${res.status}`);
    }

    fila.classList.add('eliminando-fila');
    mostrarToast('Usuario eliminado', 'ok');

    setTimeout(() => {
      cargarUsuarios();
    }, 500);

  } catch (err) {
    console.error('Error al eliminar:', err);
    boton.classList.remove('eliminando');
    boton.innerHTML = `<i class='bx bx-trash'></i> Eliminar`;
    mostrarToast(`No se pudo eliminar el usuario: ${err.message}`, 'error');
  }
}

/**
 * Utilidades: Formateo de fechas y escape HTML
 */
function formatearFecha(fecha) {
  if (!fecha) return '—';
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
}

function escaparHTML(texto) {
  if (texto == null) return '';
  return String(texto)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
  cargarUsuarios();
  document.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.addEventListener('click', () => cambiarFiltro(btn.dataset.filtro));
  });
});