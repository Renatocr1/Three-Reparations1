const bcrypt = require('bcrypt');
const Usuario = require('../models/modeloUsuario');

const usuarioController = {

  // POST /api/registro
  async registrar(req, res) {
    try {
      const { nombre, email, password } = req.body;

      // Verificamos si el email ya existe usando el modelo
      const existe = await Usuario.emailExiste(email);
      if (existe) {
        return res.status(400).json({ error: 'El correo ya está registrado' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      
      // Se registra con rol 'cliente' por defecto
      const id = await Usuario.crear({ 
          nombre, 
          correo: email, // Usamos 'correo' para coincidir con el modelo
          password: passwordHash
      });

      res.json({ mensaje: 'Registrado correctamente como cliente', id });
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

      // Devolvemos el usuario SIN la contraseña, pero CON el rol para redirección
      const { contrasena, ...usuarioSinPassword } = usuario;

      res.json({ mensaje: 'Login exitoso', usuario: usuarioSinPassword });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  },

  /**
   * GET /api/usuarios/estadisticas
   * Esta función alimenta los cuadros de Clientes, Admins y Total
   */
  async obtenerEstadisticas(req, res) {
    try {
        const usuarios = await Usuario.listarTodos();
        
        const totalUsuarios = usuarios.length;
        const clientes = usuarios.filter(u => u.rol === 'cliente').length;
        const administradores = usuarios.filter(u => u.rol === 'admin').length;

        res.json({
            totalUsuarios,
            clientes,
            administradores
        });
    } catch (error) {
        console.error('Error en estadísticas:', error);
        res.status(500).json({ error: "Error al obtener estadísticas" });
    }
  },

  // GET /api/usuarios (Lista completa para la tabla del administrador)
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