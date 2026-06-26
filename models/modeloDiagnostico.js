// ============================================
// Modelo de Diagnóstico técnico
// Archivo: models/modeloDiagnostico.js
// Un diagnóstico por reparación (UNIQUE en reparacion_id).
// ============================================
const { pool } = require('../db/conexion');

const Diagnostico = {

  async obtenerPorReparacion(reparacionId) {
    const [filas] = await pool.query(
      `SELECT d.id, d.reparacion_id, d.hallazgos, d.recomendaciones, d.repuestos,
              d.usuario_id, d.creado_en, d.actualizado_en,
              u.nombre AS tecnico_nombre
       FROM diagnosticos d
       LEFT JOIN usuarios u ON d.usuario_id = u.id
       WHERE d.reparacion_id = ?
       LIMIT 1`,
      [reparacionId]
    );
    return filas[0] || null;
  },

  // Crea o actualiza el diagnóstico (upsert por el UNIQUE de reparacion_id)
  async guardar(reparacionId, { hallazgos, recomendaciones, repuestos, usuario_id }) {
    await pool.query(
      `INSERT INTO diagnosticos (reparacion_id, hallazgos, recomendaciones, repuestos, usuario_id)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         hallazgos = VALUES(hallazgos),
         recomendaciones = VALUES(recomendaciones),
         repuestos = VALUES(repuestos),
         usuario_id = VALUES(usuario_id)`,
      [reparacionId, hallazgos, recomendaciones || null, repuestos || null, usuario_id || null]
    );
    return true;
  }

};

module.exports = Diagnostico;
