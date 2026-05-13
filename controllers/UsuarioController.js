const bcrypt = require('bcrypt');
const Usuario = require('../models/modeloUsuario');

const usuarioController = {

  // POST /api/registro
  async registrar(req, res) {
    try {
      const { nombre, email, password } = req.body;

      if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
      }

      if (nombre.trim().length < 2) {
        return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres' });
      }

      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexEmail.test(email)) {
        return res.status(400).json({ error: 'Correo con formato inválido' });
      }

      if (password.length < 3) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 3 caracteres' });
      }

      if (await Usuario.emailExiste(email)) {
        return res.status(400).json({ error: 'Este correo ya está registrado' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const id = await Usuario.crear({ nombre, email, password: passwordHash });

      res.json({ mensaje: 'Usuario registrado correctamente', id });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  },

  // POST /api/login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
      }

      const usuario = await Usuario.buscarPorCorreo(email);

      if (!usuario) {
        return res.status(401).json({ error: 'Email o contraseña incorrectos' });
      }

      const coincide = await bcrypt.compare(password, usuario.contrasena);

      if (!coincide) {
        return res.status(401).json({ error: 'Email o contraseña incorrectos' });
      }

      // Devolvemos el usuario SIN la contraseña, pero CON el rol
      const { contrasena, ...usuarioSinPassword } = usuario;

      res.json({ mensaje: 'Login exitoso', usuario: usuarioSinPassword });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  },

  // GET /api/usuarios
  async listar(req, res) {
    try {
      const usuarios = await Usuario.listarTodos();
      res.json(usuarios);
    } catch (error) {
      console.error('Error al listar usuarios:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  },

  // GET /api/usuarios/:id
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const usuario = await Usuario.buscarPorId(id);

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json(usuario);
    } catch (error) {
      console.error('Error al buscar usuario:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  },

  // DELETE /api/usuarios/:id
  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const eliminado = await Usuario.eliminar(id);

      if (!eliminado) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  }

};

module.exports = usuarioController;