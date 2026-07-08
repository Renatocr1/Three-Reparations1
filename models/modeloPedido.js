const { pool } = require('../db/conexion');

const Pedido = {

  async listarTodos() {
    const sql = `
      SELECT
        p.id              AS id,
        u.nombre          AS cliente_nombre,
        u.correo          AS cliente_correo,
        COALESCE(p.servicio, pr.nombre) AS servicio,
        p.estado          AS estado,
        p.total           AS total,
        p.creado_en       AS fecha,
        p.cantidad        AS cantidad,
        p.usuario_id      AS usuario_id,
        p.producto_id     AS producto_id
      FROM pedidos p
      INNER JOIN usuarios  u  ON p.usuario_id  = u.id
      INNER JOIN productos pr ON p.producto_id = pr.id
      ORDER BY p.id DESC
    `;
    const [filas] = await pool.query(sql);
    return filas;
  },

  async listarPorUsuario(usuarioId) {
    const [filas] = await pool.query(`
      SELECT p.id, p.cantidad, p.total, p.estado,
        COALESCE(p.servicio, pr.nombre) AS servicio,
        p.creado_en AS fecha, pr.nombre AS producto_nombre, pr.precio AS producto_precio
      FROM pedidos p
      INNER JOIN productos pr ON p.producto_id = pr.id
      WHERE p.usuario_id = ?
      ORDER BY p.id DESC
    `, [usuarioId]);
    return filas;
  },

  async crear({ usuario_id, producto_id, cantidad, total, estado, servicio }) {
    const [resultado] = await pool.query(
      `INSERT INTO pedidos (usuario_id, producto_id, cantidad, total, estado, servicio)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [usuario_id, producto_id, cantidad || 1, total || 0, estado || 'pendiente', servicio || null]
    );
    return resultado.insertId;
  },

  async actualizarEstado(id, estado) {
    const [resultado] = await pool.query('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, id]);
    return resultado.affectedRows > 0;
  },

  async eliminar(id) {
    const [resultado] = await pool.query('DELETE FROM pedidos WHERE id = ?', [id]);
    return resultado.affectedRows > 0;
  },

  async actualizar(id, { estado, total }) {
    const campos = [];
    const params = [];

    if (estado !== undefined) {
      campos.push('estado = ?');
      params.push(estado);
    }
    if (total !== undefined) {
      const t = (total === null || total === '') ? null : parseFloat(total);
      campos.push('total = ?');
      params.push(t);
    }
    if (campos.length === 0) return false;

    params.push(id);
    const [resultado] = await pool.query(
      `UPDATE pedidos SET ${campos.join(', ')} WHERE id = ?`,
      params
    );
    return resultado.affectedRows > 0;
  },
};



module.exports = Pedido;