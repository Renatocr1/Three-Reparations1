// ============================================
// Modelo de Reparaciones
// Archivo: models/modeloReparacion.js
// ============================================
const { pool } = require('../db/conexion');

const Reparacion = {

  async listarTodos() {
    const [filas] = await pool.query(`
      SELECT
        r.id, r.equipo, r.descripcion, r.estado, r.total, r.creado_en,
        u.nombre AS cliente_nombre, u.correo AS cliente_correo
      FROM reparaciones r
      INNER JOIN usuarios u ON r.usuario_id = u.id
      ORDER BY r.id DESC
    `);
    return filas;
  },

  async listarPorUsuario(usuarioId) {
    const [filas] = await pool.query(`
      SELECT id, equipo, descripcion, estado, total, creado_en
      FROM reparaciones
      WHERE usuario_id = ?
      ORDER BY id DESC
    `, [usuarioId]);
    return filas;
  },

  // ⚠️ IMPORTANTE: la primera columna es usuario_id, NO id.
  // Si dejas `id`, MySQL intenta insertar el valor en la PRIMARY KEY
  // y eso provoca "Duplicate entry 'X' for key 'PRIMARY'".
  async crear({ usuario_id, equipo, descripcion }) {
    const [resultado] = await pool.query(
      `INSERT INTO reparaciones (usuario_id, equipo, descripcion, estado)
       VALUES (?, ?, ?, 'pendiente')`,
      [usuario_id, equipo, descripcion]
    );
    return resultado.insertId;
  },

  async actualizarEstado(id, estado, total) {
    const [resultado] = await pool.query(
      'UPDATE reparaciones SET estado = ?, total = ? WHERE id = ?',
      [estado, total ?? null, id]
    );
    return resultado.affectedRows > 0;
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