// ============================================
// Modelo de Servicios del taller
// Archivo: models/modeloServicio.js
// ============================================
const { pool } = require('../db/conexion');

const Servicio = {

  // Todos los servicios (lo usa el admin)
  async listarTodos() {
    const [filas] = await pool.query(
      `SELECT id, nombre, descripcion, categoria, precio, dias_estimados, activo, creado_en
       FROM servicios
       ORDER BY activo DESC, nombre`
    );
    return filas;
  },

  // Solo los activos (lo ve el cliente en el catálogo)
  async listarActivos() {
    const [filas] = await pool.query(
      `SELECT id, nombre, descripcion, categoria, precio, dias_estimados, creado_en
       FROM servicios
       WHERE activo = 1
       ORDER BY nombre`
    );
    return filas;
  },

  async buscarPorId(id) {
    const [filas] = await pool.query(
      `SELECT id, nombre, descripcion, categoria, precio, dias_estimados, activo, creado_en
       FROM servicios WHERE id = ? LIMIT 1`,
      [id]
    );
    return filas[0] || null;
  },

  async crear({ nombre, descripcion, categoria, precio, dias_estimados }) {
    const [resultado] = await pool.query(
      `INSERT INTO servicios (nombre, descripcion, categoria, precio, dias_estimados, activo)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [nombre, descripcion || null, categoria || null, precio, dias_estimados || 1]
    );
    return resultado.insertId;
  },

  async actualizar(id, { nombre, descripcion, categoria, precio, dias_estimados, activo }) {
    const [resultado] = await pool.query(
      `UPDATE servicios
       SET nombre = ?, descripcion = ?, categoria = ?, precio = ?, dias_estimados = ?, activo = ?
       WHERE id = ?`,
      [nombre, descripcion || null, categoria || null, precio, dias_estimados || 1, activo ? 1 : 0, id]
    );
    return resultado.affectedRows > 0;
  },

  // Activar / desactivar (RF-035: no se elimina, se desactiva)
  async cambiarActivo(id, activo) {
    const [resultado] = await pool.query(
      'UPDATE servicios SET activo = ? WHERE id = ?',
      [activo ? 1 : 0, id]
    );
    return resultado.affectedRows > 0;
  }

};

module.exports = Servicio;
