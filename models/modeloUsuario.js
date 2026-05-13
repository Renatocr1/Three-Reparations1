const { pool } = require('../db/conexion');

const Usuario = {

  /**
   * Verifica si un correo ya está registrado.
   * Útil para validar antes de crear un nuevo usuario.
   */
  async emailExiste(correo) {
    const [filas] = await pool.query(
      'SELECT id FROM usuarios WHERE correo = ?',
      [correo]
    );
    return filas.length > 0;
  },

  /**
   * Crea un nuevo usuario en la base de datos.
   * Por defecto, el rol siempre será 'cliente'.
   */
  async crear({ nombre, correo, password }) {
    const [resultado] = await pool.query(
      'INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?, ?, ?, ?)',
      [nombre, correo, password, 'cliente']
    );
    return resultado.insertId;
  },

  /**
   * Busca un usuario por correo.
   * Incluye 'contrasena' y 'rol' para poder validar el login.
   */
  async buscarPorCorreo(correo) {
    const [filas] = await pool.query(
      'SELECT id, nombre, correo, contrasena, rol FROM usuarios WHERE correo = ?',
      [correo]
    );
    return filas.length > 0 ? filas[0] : null;
  },

  /**
   * Obtiene todos los usuarios registrados.
   * Ideal para mostrar en la tabla del panel de administración.
   */
  async listarTodos() {
    const [filas] = await pool.query(
      'SELECT id, nombre, correo, rol, creado_en FROM usuarios ORDER BY id DESC'
    );
    return filas;
  },

  /**
   * Busca la información de un usuario específico por su ID.
   */
  async buscarPorId(id) {
    const [filas] = await pool.query(
      'SELECT id, nombre, correo, rol, creado_en FROM usuarios WHERE id = ?',
      [id]
    );
    return filas.length > 0 ? filas[0] : null;
  },

  /**
   * Elimina un usuario de la base de datos por su ID.
   */
  async eliminar(id) {
    const [resultado] = await pool.query(
      'DELETE FROM usuarios WHERE id = ?',
      [id]
    );
    return resultado.affectedRows > 0;
  }

};

module.exports = Usuario;