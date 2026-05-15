const { pool } = require('../db/conexion');

const Pedido = {

  // Lista todos los pedidos con nombre + correo del cliente, producto y servicio
  // models/modeloPedido.js
  // models/modeloPedido.js
  listarTodos: async () => {
    try {
      const sql = `
        SELECT 
          p.id,
          u.nombre AS cliente_nombre,
          u.correo AS cliente_correo,
          p.servicio,
          p.estado,
          p.total,
          p.creado_en
        FROM pedidos p
        INNER JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN productos pr ON p.producto_id = pr.id
        ORDER BY p.id DESC
      `;
      const [rows] = await pool.query(sql);
      return rows;
    } catch (error) {
      console.error('Error en listarTodos:', error.message);
      throw error;
    }
  },

  // Lista los pedidos de un cliente en particular
  async listarPorUsuario(usuarioId) {
    const [filas] = await pool.query(`
      SELECT 
        p.id, p.cantidad, p.total, p.estado, p.servicio, p.creado_en,
        pr.nombre AS producto_nombre, pr.precio AS producto_precio
      FROM pedidos p
      INNER JOIN productos pr ON p.producto_id = pr.id
      WHERE p.usuario_id = ?
      ORDER BY p.id DESC
    `, [usuarioId]);
    return filas;
  },

  // NUEVO: Crear un pedido
  async crear({ usuario_id, producto_id, cantidad, total, estado, servicio }) {
    const [resultado] = await pool.query(
      `INSERT INTO pedidos (usuario_id, producto_id, cantidad, total, estado, servicio)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [usuario_id, producto_id, cantidad || 1, total || 0, estado || 'pendiente', servicio || null]
    );
    return resultado.insertId;
  },

  async actualizarEstado(id, estado) {
    const [resultado] = await pool.query(
      'UPDATE pedidos SET estado = ? WHERE id = ?',
      [estado, id]
    );
    return resultado.affectedRows > 0;
  },

  async eliminar(id) {
    const [resultado] = await pool.query(
      'DELETE FROM pedidos WHERE id = ?',
      [id]
    );
    return resultado.affectedRows > 0;
  }

};



module.exports = Pedido;