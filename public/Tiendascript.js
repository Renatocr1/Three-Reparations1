// ============================================
// Script para la página tienda.html (admin)
// ============================================

// Obtener admin desde sesión
const usuarioAdmin = JSON.parse(sessionStorage.getItem('usuario')) || {};

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    cargarPedidos();
    cargarReparaciones();
});

// ============================================
// CAMBIO DE PESTAÑAS
// ============================================
function cambiarTab(nombre) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    event.target.closest('.tab').classList.add('active');
    document.getElementById('panel-' + nombre).classList.add('active');
}

// ============================================
// ============== PRODUCTOS ===================
// ============================================
async function cargarProductos() {
    try {
        const respuesta = await fetch('/api/productos');
        const productos = await respuesta.json();

        const tbody = document.getElementById('tbodyProductos');
        tbody.innerHTML = '';

        if (productos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:#999;">No hay productos. ¡Agrega uno!</td></tr>`;
            return;
        }

        productos.forEach(p => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>#${p.id}</td>
                <td><strong>${p.nombre}</strong></td>
                <td>${p.categoria || '-'}</td>
                <td>$${Number(p.precio).toLocaleString('es-CL')}</td>
                <td>${p.stock}</td>
                <td>
                    <button class="btn-icon" onclick='editarProducto(${JSON.stringify(p)})'><i class='bx bx-edit'></i></button>
                    <button class="btn-icon danger" onclick="eliminarProducto(${p.id}, '${p.nombre.replace(/'/g, "\\'")}')"><i class='bx bx-trash'></i></button>
                </td>
            `;
            tbody.appendChild(fila);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

function abrirModalProducto() {
    document.getElementById('modalTitulo').textContent = 'Agregar producto';
    document.getElementById('prodId').value = '';
    document.getElementById('prodNombre').value = '';
    document.getElementById('prodDescripcion').value = '';
    document.getElementById('prodCategoria').value = '';
    document.getElementById('prodPrecio').value = '';
    document.getElementById('prodStock').value = '';
    document.getElementById('modalProducto').classList.add('active');
}

function editarProducto(producto) {
    document.getElementById('modalTitulo').textContent = 'Editar producto';
    document.getElementById('prodId').value = producto.id;
    document.getElementById('prodNombre').value = producto.nombre;
    document.getElementById('prodDescripcion').value = producto.descripcion || '';
    document.getElementById('prodCategoria').value = producto.categoria || '';
    document.getElementById('prodPrecio').value = producto.precio;
    document.getElementById('prodStock').value = producto.stock;
    document.getElementById('modalProducto').classList.add('active');
}

function cerrarModalProducto() {
    document.getElementById('modalProducto').classList.remove('active');
}

async function guardarProducto() {
    const id = document.getElementById('prodId').value;
    const datos = {
        nombre: document.getElementById('prodNombre').value.trim(),
        descripcion: document.getElementById('prodDescripcion').value.trim(),
        categoria: document.getElementById('prodCategoria').value.trim(),
        precio: parseFloat(document.getElementById('prodPrecio').value) || 0,
        stock: parseInt(document.getElementById('prodStock').value) || 0
    };

    if (!datos.nombre) {
        alert('El nombre es obligatorio');
        return;
    }

    try {
        let respuesta;
        if (id) {
            respuesta = await fetch(`/api/productos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
        } else {
            respuesta = await fetch('/api/productos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
        }

        const data = await respuesta.json();
        if (respuesta.ok) {
            cerrarModalProducto();
            cargarProductos();
        } else {
            alert(data.error || 'Error al guardar');
        }
    } catch (error) {
        console.error(error);
        alert('Error de conexión');
    }
}

async function eliminarProducto(id, nombre) {
    if (!confirm(`¿Eliminar el producto "${nombre}"?`)) return;
    try {
        const respuesta = await fetch(`/api/productos/${id}`, { method: 'DELETE' });
        if (respuesta.ok) cargarProductos();
        else alert('No se pudo eliminar');
    } catch (error) {
        console.error(error);
    }
}

// ============================================
// =============== PEDIDOS ====================
// ============================================
async function cargarPedidos() {
    try {
        const respuesta = await fetch('/api/pedidos');
        const pedidos = await respuesta.json();

        const tbody = document.getElementById('tbodyPedidos');
        tbody.innerHTML = '';

        if (pedidos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px;color:#999;">No hay pedidos todavía.</td></tr>`;
            return;
        }

        pedidos.forEach(p => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>#${p.id}</td>
                <td>
                    <strong>${p.cliente_nombre}</strong><br>
                    <small style="color:#9ca3af;">${p.cliente_correo}</small>
                </td>
                <td>${p.producto_nombre}</td>
                <td>${p.cantidad}</td>
                <td>$${Number(p.total).toLocaleString('es-CL')}</td>
                <td>
                    <select class="estado-select" onchange="cambiarEstadoPedido(${p.id}, this.value)">
                        <option value="pendiente" ${p.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="enviado" ${p.estado === 'enviado' ? 'selected' : ''}>Enviado</option>
                        <option value="entregado" ${p.estado === 'entregado' ? 'selected' : ''}>Entregado</option>
                        <option value="cancelado" ${p.estado === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                    </select>
                </td>
                <td>
                    <button class="btn-icon danger" onclick="eliminarPedido(${p.id})"><i class='bx bx-trash'></i></button>
                </td>
            `;
            tbody.appendChild(fila);
        });
    } catch (error) {
        console.error(error);
    }
}

async function cambiarEstadoPedido(id, estado) {
    try {
        await fetch(`/api/pedidos/${id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado })
        });
    } catch (error) {
        console.error(error);
    }
}

async function eliminarPedido(id) {
    if (!confirm('¿Eliminar este pedido?')) return;
    try {
        const respuesta = await fetch(`/api/pedidos/${id}`, { method: 'DELETE' });
        if (respuesta.ok) cargarPedidos();
    } catch (error) {
        console.error(error);
    }
}

// ============================================
// ============= REPARACIONES =================
// ============================================
async function cargarReparaciones() {
    try {
        const respuesta = await fetch('/api/reparaciones');
        const reparaciones = await respuesta.json();

        const tbody = document.getElementById('tbodyReparaciones');
        tbody.innerHTML = '';

        if (reparaciones.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:#999;">No hay solicitudes de reparación.</td></tr>`;
            return;
        }

        reparaciones.forEach(r => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>#${r.id}</td>
                <td>
                    <strong>${r.cliente_nombre}</strong><br>
                    <small style="color:#9ca3af;">${r.cliente_correo}</small>
                </td>
                <td>${r.equipo}</td>
                <td>${r.descripcion}</td>
                <td>
                    <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; background: ${r.estado === 'pendiente' ? '#fef3c7' : r.estado === 'en_diagnostico' ? '#dbeafe' : r.estado === 'en_reparacion' ? '#d1fae5' : r.estado === 'finalizado' ? '#d1fae5' : '#fee2e2'}; color: ${r.estado === 'pendiente' ? '#b45309' : r.estado === 'en_diagnostico' ? '#1d4ed8' : r.estado === 'en_reparacion' ? '#047857' : r.estado === 'finalizado' ? '#047857' : '#b91c1c'}; font-weight: 500; font-size: 12px;">
                        ${r.estado === 'pendiente' ? 'Pendiente' : r.estado === 'en_diagnostico' ? 'En diagnóstico' : r.estado === 'en_reparacion' ? 'En reparación' : r.estado === 'finalizado' ? 'Finalizado' : r.estado === 'entregado' ? 'Entregado' : r.estado}
                    </span>
                </td>
                <td>
                    <button class="btn-icon info" onclick="abrirDetallesReparacion(${r.id})" title="Ver detalles"><i class='bx bx-expand'></i></button>
                    <button class="btn-icon danger" onclick="eliminarReparacion(${r.id})" title="Eliminar"><i class='bx bx-trash'></i></button>
                </td>
            `;
            tbody.appendChild(fila);
        });
    } catch (error) {
        console.error(error);
    }
}

async function cambiarEstadoReparacion(id, estado) {
    try {
        const respuesta = await fetch(`/api/reparaciones/${id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                estado,
                usuario_id: usuarioAdmin.id
            })
        });
        if (respuesta.ok) {
            console.log(`Estado de reparación ${id} actualizado a: ${estado}`);
            // Recargar la tabla después de cambiar estado
            cargarReparaciones();
            alert('Estado actualizado correctamente');
        } else {
            console.error('Error al cambiar estado:', await respuesta.text());
            alert('Error al cambiar el estado');
            // Recargar para revertir el cambio visual
            cargarReparaciones();
        }
    } catch (error) {
        console.error(error);
        alert('Error de conexión');
    }
}

async function eliminarReparacion(id) {
    if (!confirm('¿Eliminar esta solicitud?')) return;
    try {
        const respuesta = await fetch(`/api/reparaciones/${id}`, { method: 'DELETE' });
        if (respuesta.ok) cargarReparaciones();
    } catch (error) {
        console.error(error);
    }
}

// ============= HISTORIAL DE REPARACIONES =================
async function verHistorialReparacion(id) {
    try {
        const respuesta = await fetch(`/api/reparaciones/${id}/historial`);
        const historial = await respuesta.json();
        
        if (!historial || historial.length === 0) {
            alert('No hay cambios de estado registrados para esta reparación.');
            return;
        }

        // Construir tabla HTML del historial
        let tablaHTML = '<table style="width:100%; border-collapse: collapse; font-size: 13px;">';
        tablaHTML += '<tr style="background: #f5f5f5; border-bottom: 2px solid #ddd;"><th style="padding:8px; text-align:left;">Fecha</th><th style="padding:8px; text-align:left;">Estado Anterior</th><th style="padding:8px; text-align:left;">Estado Nuevo</th><th style="padding:8px; text-align:left;">Cambio hecho por</th></tr>';
        
        historial.forEach(h => {
            const fecha = new Date(h.creado_en).toLocaleString('es-ES');
            const estadoAnterior = h.estado_anterior || '—';
            const estadoNuevo = h.estado_nuevo;
            const usuarioNombre = h.usuario_nombre || 'Sistema';
            
            tablaHTML += `<tr style="border-bottom: 1px solid #eee;">
                <td style="padding:8px;">${fecha}</td>
                <td style="padding:8px;"><strong>${estadoAnterior}</strong></td>
                <td style="padding:8px;"><strong style="color: #059669;">${estadoNuevo}</strong></td>
                <td style="padding:8px;">${usuarioNombre}</td>
            </tr>`;
        });
        
        tablaHTML += '</table>';
        
        // Mostrar en un modal simple (puedes mejorarlo después)
        const modal = document.createElement('div');
        modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 9999;';
        modal.innerHTML = `
            <div style="background: white; border-radius: 8px; padding: 20px; max-width: 600px; width: 90%; max-height: 70vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h3 style="margin: 0;">Historial de Cambios - Reparación #${id}</h3>
                    <button onclick="this.closest('div').parentElement.remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #999;">&times;</button>
                </div>
                ${tablaHTML}
            </div>
        `;
        
        document.body.appendChild(modal);
        
    } catch (error) {
        console.error('Error al obtener historial:', error);
        alert('Error al cargar el historial de cambios');
    }
}

// ============= MODAL DE DETALLES DE REPARACIÓN =================
let REPARACION_ACTUAL = null;

async function abrirDetallesReparacion(id) {
    try {
        // Obtener detalles de la reparación
        const respuesta = await fetch(`/api/reparaciones/${id}`);
        if (!respuesta.ok) throw new Error('No se pudo cargar la reparación');
        
        const reparacion = await respuesta.json();
        REPARACION_ACTUAL = reparacion;

        // Llenar los campos del modal
        document.getElementById('det-rep-id').textContent = '#' + id;
        document.getElementById('det-cliente-nombre').textContent = reparacion.cliente_nombre || '—';
        document.getElementById('det-cliente-correo').textContent = reparacion.cliente_correo || '—';
        document.getElementById('det-tipo').textContent = reparacion.tipo || '—';
        document.getElementById('det-marca').textContent = reparacion.marca || '—';
        document.getElementById('det-modelo').textContent = reparacion.modelo || '—';
        document.getElementById('det-descripcion').textContent = reparacion.descripcion || '—';
        document.getElementById('det-estado-select').value = reparacion.estado;
        
        // Limpiar mensaje anterior
        document.getElementById('det-msg').textContent = '';
        document.getElementById('det-msg').className = 'edit-msg';

        // Cargar historial
        await cargarHistorialEnModal(id);

        // Abrir modal
        document.getElementById('modal-detalles-reparacion').classList.add('activo');
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los detalles de la reparación');
    }
}

function cerrarModalDetallesReparacion() {
    document.getElementById('modal-detalles-reparacion').classList.remove('activo');
    REPARACION_ACTUAL = null;
}

async function cargarHistorialEnModal(repId) {
    try {
        const respuesta = await fetch(`/api/reparaciones/${repId}/historial`);
        const historial = await respuesta.json();
        
        const contenedor = document.getElementById('det-historial-container');
        
        if (!historial || historial.length === 0) {
            contenedor.innerHTML = '<p style="color:#999; text-align: center; padding: 20px 0;">No hay cambios de estado registrados.</p>';
            return;
        }

        let html = '<table style="width: 100%; border-collapse: collapse; font-size: 12px;">';
        html += '<tr style="background: #f5f5f5; border-bottom: 1px solid #ddd;">';
        html += '<th style="padding: 8px; text-align: left; font-weight: 600;">Fecha y Hora</th>';
        html += '<th style="padding: 8px; text-align: left; font-weight: 600;">Cambio</th>';
        html += '<th style="padding: 8px; text-align: left; font-weight: 600;">Quién lo hizo</th>';
        html += '</tr>';
        
        historial.forEach(h => {
            const fecha = new Date(h.creado_en).toLocaleString('es-ES');
            const cambio = (h.estado_anterior || 'inicio') + ' → ' + h.estado_nuevo;
            const usuario = h.usuario_nombre || 'Sistema';
            
            html += '<tr style="border-bottom: 1px solid #f0f0f0;">';
            html += `<td style="padding: 8px;">${fecha}</td>`;
            html += `<td style="padding: 8px;"><strong>${cambio}</strong></td>`;
            html += `<td style="padding: 8px;">${usuario}</td>`;
            html += '</tr>';
        });
        
        html += '</table>';
        contenedor.innerHTML = html;
    } catch (error) {
        console.error('Error al cargar historial:', error);
        document.getElementById('det-historial-container').innerHTML = 
            '<p style="color: #dc2626; text-align: center; padding: 20px 0;">Error al cargar el historial</p>';
    }
}

async function actualizarEstadoDesdeDetalles() {
    if (!REPARACION_ACTUAL) return;

    const nuevoEstado = document.getElementById('det-estado-select').value;
    const btnAplicar = event.target;
    const msgDiv = document.getElementById('det-msg');

    btnAplicar.disabled = true;
    btnAplicar.textContent = 'Procesando...';
    msgDiv.textContent = '';
    msgDiv.className = 'edit-msg';

    try {
        const respuesta = await fetch(`/api/reparaciones/${REPARACION_ACTUAL.id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                estado: nuevoEstado,
                usuario_id: usuarioAdmin.id
            })
        });

        if (respuesta.ok) {
            msgDiv.textContent = '✓ Estado actualizado correctamente';
            msgDiv.className = 'edit-msg ok';
            REPARACION_ACTUAL.estado = nuevoEstado;
            
            // Recargar historial después de 1 segundo
            setTimeout(() => {
                cargarHistorialEnModal(REPARACION_ACTUAL.id);
            }, 1000);
            
            // Recargar tabla después de 2 segundos
            setTimeout(() => {
                cargarReparaciones();
            }, 2000);
        } else {
            const error = await respuesta.json().catch(() => ({}));
            msgDiv.textContent = '✗ ' + (error.error || 'Error al actualizar');
            msgDiv.className = 'edit-msg error';
        }
    } catch (error) {
        console.error('Error:', error);
        msgDiv.textContent = '✗ Error de conexión';
        msgDiv.className = 'edit-msg error';
    } finally {
        btnAplicar.disabled = false;
        btnAplicar.textContent = 'Aplicar cambio';
    }
}