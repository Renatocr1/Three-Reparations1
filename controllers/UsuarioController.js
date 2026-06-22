const bcrypt = require('bcrypt');
const Usuario = require('../models/modeloUsuario');

const usuarioController = {

  async registrar(req, res) {
    try {
      const { nombre, email, password } = req.body || {};

      if (typeof nombre !== 'string' || nombre.trim() === '') {
        return res.status(400).json({ error: 'El nombre es obligatorio' });
      }
      if (typeof email !== 'string' || email.trim() === '') {
        return res.status(400).json({ error: 'El correo es obligatorio' });      }

      const emailRegex =/^[^\s@]+@gmail\.com$/i;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ error: 'El correo no tiene un formato válido' });
      }
      if (typeof password !== 'string' || password.length === 0) {
        return res.status(400).json({ error: 'La contraseña es obligatoria' });
      }
      if (password.length < 4) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres' });
      }

      const nombreLimpio = nombre.trim();
      const emailLimpio = email.trim().toLowerCase();

      const existe = await Usuario.emailExiste(emailLimpio);
      if (existe) {
        return res.status(400).json({ error: 'El correo ya está registrado' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      if (typeof passwordHash !== 'string' || passwordHash.length === 0) {
        console.error('bcrypt devolvió un hash inválido:', passwordHash);
        return res.status(500).json({ error: 'No se pudo procesar la contraseña' });
      }

      const id = await Usuario.crear({
        nombre: nombreLimpio,
        correo: emailLimpio,
        password: passwordHash
      });

      return res.json({ mensaje: 'Registrado correctamente como cliente', id });
    } catch (error) {
      console.error('Error en registro:', error);
      return res.status(500).json({ error: 'Error en el servidor' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body || {};

      if (typeof email !== 'string' || email.trim() === '') {
        return res.status(400).json({ error: 'Email es obligatorio' });
      }
      if (typeof password !== 'string' || password.length === 0) {
        return res.status(400).json({ error: 'Contraseña es obligatoria' });
      }

      const emailLimpio = email.trim().toLowerCase();
      const usuario = await Usuario.buscarPorCorreo(emailLimpio);

      if (!usuario) {
        return res.status(401).json({ error: 'Email o contraseña incorrectos' });
      }

      const coincide = await bcrypt.compare(password, usuario.contrasena);
      if (!coincide) {
        return res.status(401).json({ error: 'Email o contraseña incorrectos' });
      }

      const { contrasena, ...usuarioSinPassword } = usuario;
      return res.json({ mensaje: 'Login exitoso', usuario: usuarioSinPassword });
    } catch (error) {
      console.error('Error en login:', error);
      return res.status(500).json({ error: 'Error en el servidor' });
    }
  },

  async obtenerEstadisticas(req, res) {
    try {
      const usuarios = await Usuario.listarTodos();
      const totalUsuarios = usuarios.length;
      const clientes = usuarios.filter(u => u.rol === 'cliente').length;
      const administradores = usuarios.filter(u => u.rol === 'admin').length;
      return res.json({ totalUsuarios, clientes, administradores });
    } catch (error) {
      console.error('Error en estadísticas:', error);
      return res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  },

  async listar(req, res) {
    try {
      const usuarios = await Usuario.listarTodos();
      return res.json(usuarios);
    } catch (error) {
      console.error('Error al listar usuarios:', error);
      return res.status(500).json({ error: 'Error en el servidor' });
    }
  },

  async obtenerPorId(req, res) {
    try {
      const usuario = await Usuario.buscarPorId(req.params.id);
      if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
      return res.json(usuario);
    } catch (error) {
      console.error('Error al buscar usuario:', error);
      return res.status(500).json({ error: 'Error en el servidor' });
    }
  },

  async eliminar(req, res) {
    try {
      const eliminado = await Usuario.eliminar(req.params.id);
      if (!eliminado) return res.status(404).json({ error: 'Usuario no encontrado' });
      return res.json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      return res.status(500).json({ error: 'Error en el servidor' });
    }
  }

};

module.exports = usuarioController;
