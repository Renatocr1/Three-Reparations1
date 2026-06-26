// ============================================
// Modelo de Productos (Tienda)
// Archivo: models/modeloProducto.js
// ============================================
const { pool } = require('../db/conexion');

const Producto = {

  async listarTodos() {
    const [filas] = await pool.query(
      `SELECT id, nombre, descripcion, precio, stock, categoria, creado_en
       FROM productos
       ORDER BY id DESC`
    );
    return filas;
  },

  async buscarPorId(id) {
    const [filas] = await pool.query(
      `SELECT id, nombre, descripcion, precio, stock, categoria, creado_en
       FROM productos WHERE id = ? LIMIT 1`,
      [id]
    );
    return filas[0] || null;
  },

  async crear({ nombre, descripcion, precio, stock = 0, categoria }) {
    const [resultado] = await pool.query(
      `INSERT INTO productos (nombre, descripcion, precio, stock, categoria)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, descripcion || null, precio, stock, categoria || null]
    );
    return resultado.insertId;
  },

  async actualizar(id, { nombre, descripcion, precio, stock, categoria }) {
    const [resultado] = await pool.query(
      `UPDATE productos
       SET nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria = ?
       WHERE id = ?`,
      [nombre, descripcion || null, precio, stock || 0, categoria || null, id]
    );
    return resultado.affectedRows > 0;
  },

  async eliminar(id) {
    const [resultado] = await pool.query('DELETE FROM productos WHERE id = ?', [id]);
    return resultado.affectedRows > 0;
  }

};

module.exports = Producto;
