const { pool } = require('../db/conexion');

const Usuario = {

  async emailExiste(correo) {
    const [filas] = await pool.query(
      'SELECT id FROM usuarios WHERE correo = ?',
      [correo]
    );
    return filas.length > 0;
  },

  async crear({ nombre, email, password }) {
    const [resultado] = await pool.query(
      'INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)',
      [nombre, email, password]
    );
    return resultado.insertId;
  },

  async buscarPorCorreo(correo) {
    const [filas] = await pool.query(
      'SELECT id, nombre, correo, contrasena FROM usuarios WHERE correo = ?',
      [correo]
    );
    return filas.length > 0 ? filas[0] : null;
  },

  async listarTodos() {
    const [filas] = await pool.query(
      'SELECT id, nombre, correo, creado_en FROM usuarios ORDER BY id DESC'
    );
    return filas;
  },

  async buscarPorId(id) {
    const [filas] = await pool.query(
      'SELECT id, nombre, correo, creado_en FROM usuarios WHERE id = ?',
      [id]
    );
    return filas.length > 0 ? filas[0] : null;
  },

  async eliminar(id) {
    const [resultado] = await pool.query(
      'DELETE FROM usuarios WHERE id = ?',
      [id]
    );
    return resultado.affectedRows > 0;
  }

};

module.exports = Usuario;