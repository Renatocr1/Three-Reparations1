// ============================================
// Controlador de Pedidos
// Archivo: controllers/pedidoController.js
// ============================================
const Pedido = require('../models/modeloPedido');

const ESTADOS_VALIDOS = ['pendiente', 'enviado', 'entregado', 'cancelado'];

const pedidoController = {

  // GET /api/pedidos
  async listar(req, res) {
    try {
      const pedidos = await Pedido.listarTodos();
      return res.json(pedidos);
    } catch (error) {
      console.error('Error al listar pedidos:', error);
      return res.status(500).json({ error: 'Error al listar pedidos' });
    }
  },

  // GET /api/pedidos/usuario/:id
  async listarPorUsuario(req, res) {
    try {
      const idParam = parseInt(req.params.id, 10);
      if (isNaN(idParam)) {
        console.warn('listarPorUsuario pedidos: id inválido =', req.params.id);
        return res.status(400).json({ error: 'id de usuario inválido' });
      }
      const pedidos = await Pedido.listarPorUsuario(idParam);
      console.log(`Pedidos encontrados para usuario ${idParam}:`, pedidos.length);
      return res.json(pedidos);
    } catch (error) {
      console.error('Error al listar pedidos del usuario:', error);
      return res.status(500).json({ error: 'Error al listar pedidos del cliente' });
    }
  },

  // POST /api/pedidos
  async crear(req, res) {
    try {
      const { usuario_id, producto_id, cantidad, total, estado, servicio } = req.body || {};

      if (!usuario_id || isNaN(parseInt(usuario_id))) {
        return res.status(400).json({ error: 'usuario_id es obligatorio' });
      }
      if (!producto_id || isNaN(parseInt(producto_id))) {
        return res.status(400).json({ error: 'producto_id es obligatorio' });
      }

      const nuevoId = await Pedido.crear({
        usuario_id: parseInt(usuario_id),
        producto_id: parseInt(producto_id),
        cantidad: parseInt(cantidad) || 1,
        total: parseFloat(total) || 0,
        estado: estado || 'pendiente',
        servicio: servicio || null
      });

      return res.status(201).json({
        mensaje: 'Pedido creado correctamente',
        id: nuevoId
      });
    } catch (error) {
      console.error('Error al crear pedido:', error);
      return res.status(500).json({ error: 'Error al crear pedido' });
    }
  },

  // PUT /api/pedidos/:id/estado
  async cambiarEstado(req, res) {
    try {
      const { estado } = req.body;
      if (!ESTADOS_VALIDOS.includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido' });
      }
      const actualizado = await Pedido.actualizarEstado(req.params.id, estado);
      if (!actualizado) return res.status(404).json({ error: 'Pedido no encontrado' });
      return res.json({ mensaje: 'Estado actualizado' });
    } catch (error) {
      console.error('Error al actualizar pedido:', error);
      return res.status(500).json({ error: 'Error al actualizar pedido' });
    }
  },

  // DELETE /api/pedidos/:id
  async eliminar(req, res) {
    try {
      const eliminado = await Pedido.eliminar(req.params.id);
      if (!eliminado) return res.status(404).json({ error: 'Pedido no encontrado' });
      return res.json({ mensaje: 'Pedido eliminado' });
    } catch (error) {
      console.error('Error al eliminar pedido:', error);
      return res.status(500).json({ error: 'Error al eliminar pedido' });
    }
  },

  async actualizar(req, res) {
    try {
        const { estado, total } = req.body || {};
        if (estado !== undefined && !ESTADOS_VALIDOS.includes(estado)) {
            return res.status(400).json({ error: 'Estado inválido' });
        }
        const ok = await Pedido.actualizar(req.params.id, { estado, total });
        if (!ok) return res.status(404).json({ error: 'Pedido no encontrado' });
        return res.json({ mensaje: 'Pedido actualizado' });
    } catch (error) {
        console.error('Error al actualizar pedido:', error);
        return res.status(500).json({ error: 'Error al actualizar pedido' });
    }
},

};

module.exports = pedidoController;