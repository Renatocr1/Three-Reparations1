// ============================================
// Modelo de Usuarios
// Archivo: models/modeloUsuario.js
// ============================================
const { pool } = require('../db/conexion');

const Usuario = {

  /**
   * Devuelve true si el correo ya está registrado.
   */
  async emailExiste(correo) {
    const [filas] = await pool.query(
      'SELECT id FROM usuarios WHERE correo = ? LIMIT 1',
      [correo]
    );
    return filas.length > 0;
  },

  /**
   * Crea un nuevo usuario con rol 'cliente' por defecto.
   * Recibe la contraseña YA HASHEADA por el controlador.
   * Devuelve el id generado.
   */
  async crear({ nombre, correo, password, rol = 'cliente' }) {
    const [resultado] = await pool.query(
      `INSERT INTO usuarios (nombre, correo, contrasena, rol)
       VALUES (?, ?, ?, ?)`,
      [nombre, correo, password, rol]
    );
    return resultado.insertId;
  },

  /**
   * Busca un usuario por su correo (lo necesita el login).
   * Devuelve TODOS los campos, incluida la contraseña hasheada,
   * porque el controlador necesita compararla con bcrypt.
   */
  async buscarPorCorreo(correo) {
    const [filas] = await pool.query(
      'SELECT id, nombre, correo, contrasena, rol, creado_en FROM usuarios WHERE correo = ? LIMIT 1',
      [correo]
    );
    return filas[0] || null;
  },

  /**
   * Busca un usuario por su id (sin la contraseña).
   */
  async buscarPorId(id) {
    const [filas] = await pool.query(
      'SELECT id, nombre, correo, rol, creado_en FROM usuarios WHERE id = ? LIMIT 1',
      [id]
    );
    return filas[0] || null;
  },

  /**
   * Lista todos los usuarios (sin la contraseña).
   * Lo usa el panel de administración.
   */
  async listarTodos() {
    const [filas] = await pool.query(
      `SELECT id, nombre, correo, rol, creado_en
       FROM usuarios
       ORDER BY id DESC`
    );
    return filas;
  },

  /**
   * Elimina un usuario por id.
   * Devuelve true si efectivamente borró una fila.
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