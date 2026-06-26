// ============================================
// Modelo de Reparaciones
// Archivo: models/modeloReparacion.js
// ============================================
const { pool } = require('../db/conexion');

const Reparacion = {

  // Lista todas las reparaciones, con filtros opcionales para el panel admin
  // (estado, rango de fechas, y búsqueda por id/cliente).
  async listarTodos(filtros = {}) {
    const condiciones = [];
    const params = [];

    if (filtros.estado) {
      condiciones.push('r.estado = ?');
      params.push(filtros.estado);
    }
    if (filtros.fechaDesde) {
      condiciones.push('DATE(r.fecha_registro) >= ?');
      params.push(filtros.fechaDesde);
    }
    if (filtros.fechaHasta) {
      condiciones.push('DATE(r.fecha_registro) <= ?');
      params.push(filtros.fechaHasta);
    }
    if (filtros.q) {
      condiciones.push('(CAST(r.id AS CHAR) = ? OR u.nombre LIKE ? OR u.correo LIKE ?)');
      params.push(filtros.q, `%${filtros.q}%`, `%${filtros.q}%`);
    }

    const where = condiciones.length ? 'WHERE ' + condiciones.join(' AND ') : '';
    const [filas] = await pool.query(`
      SELECT
        r.id, r.equipo, r.descripcion, r.estado, r.total, r.fecha_registro AS creado_en,
        r.marca, r.modelo, r.fecha_problema, r.servicio_id,
        s.nombre AS servicio_nombre,
        u.nombre AS cliente_nombre, u.correo AS cliente_correo
      FROM reparaciones r
      INNER JOIN usuarios u ON r.usuario_id = u.id
      LEFT JOIN servicios s ON r.servicio_id = s.id
      ${where}
      ORDER BY r.id DESC
    `, params);
    return filas;
  },

  async listarPorUsuario(usuarioId) {
    const [filas] = await pool.query(`
      SELECT r.id, r.equipo, r.marca, r.modelo, r.descripcion, r.estado, r.total,
        r.fecha_registro AS creado_en, r.fecha_problema, r.servicio_id,
        s.nombre AS servicio_nombre
      FROM reparaciones r
      LEFT JOIN servicios s ON r.servicio_id = s.id
      WHERE r.usuario_id = ?
      ORDER BY r.id DESC
    `, [usuarioId]);
    return filas;
  },

  // ⚠️ IMPORTANTE: la primera columna es usuario_id, NO id.
  // Si dejas `id`, MySQL intenta insertar el valor en la PRIMARY KEY
  // y eso provoca "Duplicate entry 'X' for key 'PRIMARY'".
  async crear({ usuario_id, servicio_id, equipo, marca, modelo, fecha_problema, descripcion }) {
    const [resultado] = await pool.query(
      `INSERT INTO reparaciones (usuario_id, servicio_id, equipo, marca, modelo, fecha_problema, descripcion, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
      [usuario_id, servicio_id || null, equipo, marca || '', modelo || '', fecha_problema || null, descripcion]
    );
    return resultado.insertId;
  },

  async actualizarEstado(id, estado, total, usuarioIdAdmin = null) {
    // 1. Obtener estado actual
    const [filas] = await pool.query('SELECT estado FROM reparaciones WHERE id = ?', [id]);
    if (filas.length === 0) return false;

    const estadoAnterior = filas[0].estado;

    // 2. Actualizar estado
    const [resultado] = await pool.query(
      'UPDATE reparaciones SET estado = ?, total = ? WHERE id = ?',
      [estado, total ?? null, id]
    );

    if (resultado.affectedRows > 0) {
      // 3. Registrar en historial
      await pool.query(
        `INSERT INTO reparacion_historial (reparacion_id, estado_anterior, estado_nuevo, usuario_id)
         VALUES (?, ?, ?, ?)`,
        [id, estadoAnterior, estado, usuarioIdAdmin]
      );
      return true;
    }
    return false;
  },

  async obtenerHistorial(reparacionId) {
    const [filas] = await pool.query(`
      SELECT
        h.id, h.estado_anterior, h.estado_nuevo, h.usuario_id, h.creado_en,
        u.nombre AS usuario_nombre, u.rol AS usuario_rol
      FROM reparacion_historial h
      LEFT JOIN usuarios u ON h.usuario_id = u.id
      WHERE h.reparacion_id = ?
      ORDER BY h.creado_en DESC
    `, [reparacionId]);
    return filas;
  },

  async obtenerPorId(id) {
    const [filas] = await pool.query(`
      SELECT
        r.id, r.equipo, r.descripcion, r.estado, r.total, r.fecha_registro AS creado_en,
        r.marca, r.modelo, r.fecha_problema, r.usuario_id, r.servicio_id,
        s.nombre AS servicio_nombre,
        u.nombre AS cliente_nombre, u.correo AS cliente_correo
      FROM reparaciones r
      INNER JOIN usuarios u ON r.usuario_id = u.id
      LEFT JOIN servicios s ON r.servicio_id = s.id
      WHERE r.id = ?
    `, [id]);
    return filas.length > 0 ? filas[0] : null;
  },

  async eliminar(id) {
    const [resultado] = await pool.query(
      'DELETE FROM reparaciones WHERE id = ?',
      [id]
    );
    return resultado.affectedRows > 0;
  }

};

module.exports = Reparacion;