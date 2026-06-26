// ============================================
// Controlador de Reparaciones
// Archivo: controllers/reparacionController.js
// ============================================
const Reparacion = require('../models/modeloReparacion');
const Diagnostico = require('../models/modeloDiagnostico');

const ESTADOS_VALIDOS = ['pendiente', 'en_diagnostico', 'en_reparacion', 'finalizado', 'entregado'];

const reparacionController = {

  async listar(req, res) {
    try {
      // Filtros del panel admin (estado / rango de fechas / búsqueda por id o cliente)
      const filtros = {
        estado: ESTADOS_VALIDOS.includes(req.query.estado) ? req.query.estado : undefined,
        fechaDesde: req.query.fechaDesde || undefined,
        fechaHasta: req.query.fechaHasta || undefined,
        q: req.query.q ? String(req.query.q).trim() : undefined
      };
      const reparaciones = await Reparacion.listarTodos(filtros);
      return res.json(reparaciones);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al listar reparaciones' });
    }
  },

  async listarPorUsuario(req, res) {
    try {
      let idParam = parseInt(req.params.id, 10);
      if (isNaN(idParam)) {
        console.warn('listarPorUsuario reparaciones: id inválido =', req.params.id);
        return res.status(400).json({ error: 'id de usuario inválido' });
      }
      // Un cliente solo puede ver SUS reparaciones (no las de otro usuario).
      if (req.session && req.session.usuario && req.session.usuario.rol === 'cliente') {
        idParam = req.session.usuario.id;
      }
      const reparaciones = await Reparacion.listarPorUsuario(idParam);
      console.log(`Reparaciones encontradas para usuario ${idParam}:`, reparaciones.length);
      return res.json(reparaciones);
    } catch (error) {
      console.error('Error al listar reparaciones del cliente:', error);
      return res.status(500).json({ error: 'Error al listar reparaciones del cliente' });
    }
  },

  async crear(req, res) {
    try {
      // 1. Recibimos los nuevos campos que envía el frontend
      const { usuario_id, servicio_id, tipo, marca, modelo, descripcion } = req.body || {};

      // 2. El dueño de la solicitud es el usuario de la sesión (más seguro que
      //    confiar en el id del body). Si no hubiera sesión, usamos el del body.
      const idNum = (req.session && req.session.usuario)
        ? req.session.usuario.id
        : parseInt(usuario_id, 10);
      if (!idNum || isNaN(idNum)) {
        return res.status(400).json({ error: 'usuario_id es obligatorio' });
      }

      // 3. Validación de campos (Ahora validamos tipo, marca y modelo)
      if (!tipo || tipo.trim() === '') {
        return res.status(400).json({ error: 'El tipo de dispositivo es obligatorio' });
      }
      if (!marca || marca.trim() === '') {
        return res.status(400).json({ error: 'La marca es obligatoria' });
      }
      if (!modelo || modelo.trim() === '') {
        return res.status(400).json({ error: 'El modelo es obligatorio' });
      }
      if (!descripcion || descripcion.trim() === '' || descripcion.length < 15) {
        return res.status(400).json({ error: 'La descripción es obligatoria y debe tener al menos 15 caracteres' });
      }

      // 4. Combinamos todo en la variable 'equipo' que tu modelo espera
      const equipoConcatenado = `${tipo} - ${marca} ${modelo}`;
      // fecha_problema: si el frontend no lo envía, usamos la fecha actual
      const hoy = new Date();
      const fechaProblema = hoy.toISOString().slice(0, 10); // YYYY-MM-DD

      const nuevoId = await Reparacion.crear({
        usuario_id: idNum,
        servicio_id: servicio_id ? parseInt(servicio_id, 10) : null,
        equipo: equipoConcatenado,
        marca: marca.trim(),
        modelo: modelo.trim(),
        fecha_problema: fechaProblema,
        descripcion: descripcion.trim()
      });

      console.log(`Reparación creada id=${nuevoId} para usuario ${idNum}`);
      return res.status(201).json({
        mensaje: 'Reparación solicitada correctamente',
        id: nuevoId
      });
    } catch (error) {
      console.error('Error al crear reparación:', error);
      return res.status(500).json({ error: 'Error al crear reparación' });
    }
  },

  async cambiarEstado(req, res) {
    try {
      const { estado, total, usuario_id } = req.body;
      if (!ESTADOS_VALIDOS.includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido. Estados válidos: ' + ESTADOS_VALIDOS.join(', ') });
      }
      const totalNum = (total !== null && total !== undefined && total !== '') ? parseFloat(total) : null;
      console.log(`[PUT reparacion] id=${req.params.id} estado=${estado} total=${totalNum} usuario_admin=${usuario_id}`);
      const actualizado = await Reparacion.actualizarEstado(req.params.id, estado, totalNum, usuario_id);
      console.log(`[PUT reparacion] actualizado=${actualizado}`);
      if (!actualizado) return res.status(404).json({ error: 'Reparación no encontrada' });
      return res.json({ mensaje: 'Estado y total actualizados', total: totalNum });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al actualizar reparación' });
    }
  },

  async obtenerHistorial(req, res) {
    try {
      const reparacionId = parseInt(req.params.id, 10);
      if (isNaN(reparacionId)) {
        return res.status(400).json({ error: 'ID de reparación inválido' });
      }
      const historial = await Reparacion.obtenerHistorial(reparacionId);
      return res.json(historial);
    } catch (error) {
      console.error('Error al obtener historial:', error);
      return res.status(500).json({ error: 'Error al obtener historial' });
    }
  },

  async obtener(req, res) {
    try {
      const reparacionId = parseInt(req.params.id, 10);
      if (isNaN(reparacionId)) {
        return res.status(400).json({ error: 'ID de reparación inválido' });
      }
      const reparacion = await Reparacion.obtenerPorId(reparacionId);
      if (!reparacion) {
        return res.status(404).json({ error: 'Reparación no encontrada' });
      }
      return res.json(reparacion);
    } catch (error) {
      console.error('Error al obtener reparación:', error);
      return res.status(500).json({ error: 'Error al obtener reparación' });
    }
  },

  async eliminar(req, res) {
    try {
      const eliminado = await Reparacion.eliminar(req.params.id);
      if (!eliminado) return res.status(404).json({ error: 'Reparación no encontrada' });
      return res.json({ mensaje: 'Reparación eliminada' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al eliminar reparación' });
    }
  },



// ¡AÑADE ESTO!
  async actualizar(req, res){
    try {
      const { equipo, descripcion } = req.body;
      const id = req.params.id;

      // Aquí llamas a tu modelo (asegúrate de que Reparacion.actualizar exista en tu modelo)
      const actualizado = await Reparacion.actualizar(id, { equipo, descripcion });
      
      if (!actualizado) return res.status(404).json({ error: 'Reparación no encontrada' });
      return res.json({ mensaje: 'Reparación actualizada con éxito' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al actualizar la reparación' });
    }
  },

  // GET /api/reparaciones/:id/diagnostico  -> devuelve el diagnóstico (o null)
  async obtenerDiagnostico(req, res) {
    try {
      const reparacionId = parseInt(req.params.id, 10);
      if (isNaN(reparacionId)) {
        return res.status(400).json({ error: 'ID de reparación inválido' });
      }
      const diagnostico = await Diagnostico.obtenerPorReparacion(reparacionId);
      return res.json(diagnostico); // null si todavía no tiene diagnóstico
    } catch (error) {
      console.error('Error al obtener diagnóstico:', error);
      return res.status(500).json({ error: 'Error al obtener diagnóstico' });
    }
  },

  // PUT /api/reparaciones/:id/diagnostico  -> crea o actualiza el diagnóstico (solo admin)
  async guardarDiagnostico(req, res) {
    try {
      const reparacionId = parseInt(req.params.id, 10);
      if (isNaN(reparacionId)) {
        return res.status(400).json({ error: 'ID de reparación inválido' });
      }
      const { hallazgos, recomendaciones, repuestos } = req.body || {};
      if (!hallazgos || hallazgos.trim().length < 5) {
        return res.status(400).json({ error: 'Los hallazgos son obligatorios (mínimo 5 caracteres)' });
      }
      const reparacion = await Reparacion.obtenerPorId(reparacionId);
      if (!reparacion) return res.status(404).json({ error: 'Reparación no encontrada' });

      const usuarioId = (req.session && req.session.usuario) ? req.session.usuario.id : null;
      await Diagnostico.guardar(reparacionId, {
        hallazgos: hallazgos.trim(),
        recomendaciones: recomendaciones ? recomendaciones.trim() : null,
        repuestos: repuestos ? repuestos.trim() : null,
        usuario_id: usuarioId
      });
      return res.json({ mensaje: 'Diagnóstico guardado' });
    } catch (error) {
      console.error('Error al guardar diagnóstico:', error);
      return res.status(500).json({ error: 'Error al guardar diagnóstico' });
    }
  }
};
 // Cierre del objeto reparacionController

module.exports = reparacionController;