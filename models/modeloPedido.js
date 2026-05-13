const { pool } = require('../db/conexion');

const Pedido = {

  // Lista todos los pedidos con nombre del cliente y nombre del producto
  async listarTodos() {
    const [filas] = await pool.query(`
      SELECT 
        p.id, p.cantidad, p.total, p.estado, p.creado_en,
        u.nombre AS cliente_nombre, u.correo AS cliente_correo,
        pr.nombre AS producto_nombre
      FROM pedidos p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      INNER JOIN productos pr ON p.producto_id = pr.id
      ORDER BY p.id DESC
    `);
    return filas;
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
