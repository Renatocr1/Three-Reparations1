const Producto = require('../models/modeloProducto');

const productoController = {

  async listar(req, res) {
    try {
      const productos = await Producto.listarTodos();
      res.json(productos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al listar productos' });
    }
  },

  async obtenerPorId(req, res) {
    try {
      const producto = await Producto.buscarPorId(req.params.id);
      if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json(producto);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  },

  async crear(req, res) {
    try {
      const { nombre, descripcion, precio, stock, categoria } = req.body;
      if (!nombre || precio == null) {
        return res.status(400).json({ error: 'Nombre y precio son obligatorios' });
      }
      const id = await Producto.crear({ nombre, descripcion, precio, stock: stock || 0, categoria });
      res.json({ mensaje: 'Producto creado', id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear producto' });
    }
  },

  async actualizar(req, res) {
    try {
      const { nombre, descripcion, precio, stock, categoria } = req.body;
      const actualizado = await Producto.actualizar(req.params.id, { nombre, descripcion, precio, stock, categoria });
      if (!actualizado) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json({ mensaje: 'Producto actualizado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar producto' });
    }
  },

  async eliminar(req, res) {
    try {
      const eliminado = await Producto.eliminar(req.params.id);
      if (!eliminado) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json({ mensaje: 'Producto eliminado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al eliminar producto' });
    }
  }

};

module.exports = productoController;
