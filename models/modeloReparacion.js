const { pool } = require('../db/conexion');

const Reparacion = {

  async listarTodos() {
    const [filas] = await pool.query(`
      SELECT 
        r.id, r.equipo, r.descripcion, r.estado, r.creado_en,
        u.nombre AS cliente_nombre, u.correo AS cliente_correo
      FROM reparaciones r
      INNER JOIN usuarios u ON r.usuario_id = u.id
      ORDER BY r.id DESC
    `);
    return filas;
  },

  async actualizarEstado(id, estado) {
    const [resultado] = await pool.query(
      'UPDATE reparaciones SET estado = ? WHERE id = ?',
      [estado, id]
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
