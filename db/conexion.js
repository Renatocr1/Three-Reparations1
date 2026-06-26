// ============================================
// Conexión a MySQL (XAMPP) — db/conexion.js
// ============================================
const mysql = require('mysql2/promise');

// Configuración por variables de entorno con los valores de XAMPP por defecto,
// para que funcione igual en el equipo de desarrollo (XAMPP) y en otros entornos.
const DB_NAME = process.env.DB_NAME || 'integracion1';

const baseConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10
};

const pool = mysql.createPool({ ...baseConfig, database: DB_NAME });

async function asegurarEstructura() {
  const conexionInicial = await mysql.createConnection(baseConfig);
  try {
    await conexionInicial.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`
       CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`
    );
  } finally {
    await conexionInicial.end();
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INT(11) NOT NULL AUTO_INCREMENT,
      nombre VARCHAR(100) NOT NULL,
      correo VARCHAR(150) NOT NULL,
      contrasena VARCHAR(255) NOT NULL,
      rol ENUM('admin','cliente') NOT NULL DEFAULT 'cliente',
      creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY correo (correo)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS productos (
      id INT(11) NOT NULL AUTO_INCREMENT,
      nombre VARCHAR(150) NOT NULL,
      descripcion TEXT DEFAULT NULL,
      precio DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      stock INT(11) NOT NULL DEFAULT 0,
      categoria VARCHAR(80) DEFAULT NULL,
      creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id INT(11) NOT NULL AUTO_INCREMENT,
      usuario_id INT(11) NOT NULL,
      producto_id INT(11) NOT NULL,
      cantidad INT(11) NOT NULL DEFAULT 1,
      total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      estado ENUM('pendiente','enviado','entregado','cancelado') NOT NULL DEFAULT 'pendiente',
      servicio VARCHAR(150) DEFAULT NULL,
      creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY usuario_id (usuario_id),
      KEY producto_id (producto_id),
      CONSTRAINT pedidos_ibfk_1 FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
      CONSTRAINT pedidos_ibfk_2 FOREIGN KEY (producto_id) REFERENCES productos (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  // Si la tabla `pedidos` existe sin la columna `servicio`, la añadimos
  const [colsPedidos] = await pool.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'pedidos' AND COLUMN_NAME = 'servicio'`,
    [DB_NAME]
  );
  if (colsPedidos.length === 0) {
    await pool.query(`ALTER TABLE pedidos ADD COLUMN servicio VARCHAR(150) DEFAULT NULL`);
  }

  // Catálogo de servicios del taller (lo que se ofrece reparar)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS servicios (
      id INT(11) NOT NULL AUTO_INCREMENT,
      nombre VARCHAR(150) NOT NULL,
      descripcion TEXT DEFAULT NULL,
      categoria VARCHAR(80) DEFAULT NULL,
      precio DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      dias_estimados INT(11) NOT NULL DEFAULT 1,
      activo TINYINT(1) NOT NULL DEFAULT 1,
      creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reparaciones (
      id INT(11) NOT NULL AUTO_INCREMENT,
      usuario_id INT(11) NOT NULL,
      servicio_id INT(11) DEFAULT NULL,
      equipo VARCHAR(150) NOT NULL,
      marca VARCHAR(50) NOT NULL DEFAULT '',
      modelo VARCHAR(50) NOT NULL DEFAULT '',
      fecha_problema DATE DEFAULT NULL,
      descripcion TEXT NOT NULL,
      estado ENUM('pendiente','en_diagnostico','en_reparacion','finalizado','entregado') NOT NULL DEFAULT 'pendiente',
      total DECIMAL(10,2) DEFAULT NULL,
      fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY usuario_id (usuario_id),
      KEY servicio_id (servicio_id),
      CONSTRAINT reparaciones_ibfk_1 FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  // Historial de cambios de estado de cada reparación (trazabilidad)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reparacion_historial (
      id INT(11) NOT NULL AUTO_INCREMENT,
      reparacion_id INT(11) NOT NULL,
      estado_anterior VARCHAR(50) DEFAULT NULL,
      estado_nuevo VARCHAR(50) NOT NULL,
      usuario_id INT(11) DEFAULT NULL,
      notas TEXT DEFAULT NULL,
      creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY reparacion_id (reparacion_id),
      KEY usuario_id (usuario_id),
      CONSTRAINT fk_historial_reparacion FOREIGN KEY (reparacion_id) REFERENCES reparaciones (id) ON DELETE CASCADE,
      CONSTRAINT fk_historial_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  // Diagnóstico técnico de una reparación (uno por reparación)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS diagnosticos (
      id INT(11) NOT NULL AUTO_INCREMENT,
      reparacion_id INT(11) NOT NULL,
      hallazgos TEXT NOT NULL,
      recomendaciones TEXT DEFAULT NULL,
      repuestos TEXT DEFAULT NULL,
      usuario_id INT(11) DEFAULT NULL,
      creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY reparacion_id (reparacion_id),
      KEY usuario_id (usuario_id),
      CONSTRAINT fk_diag_reparacion FOREIGN KEY (reparacion_id) REFERENCES reparaciones (id) ON DELETE CASCADE,
      CONSTRAINT fk_diag_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  // Si la tabla `reparaciones` no tiene columna `total`, la añadimos
  const [colsTotal] = await pool.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'reparaciones' AND COLUMN_NAME = 'total'`,
    [DB_NAME]
  );
  if (colsTotal.length === 0) {
    console.warn('La tabla `reparaciones` no tiene la columna `total`; la estoy agregando.');
    await pool.query(`ALTER TABLE reparaciones ADD COLUMN total DECIMAL(10,2) DEFAULT NULL`);
  }

  // Si la tabla `reparaciones` ya existía sin la columna `usuario_id`
  // (caso de bases creadas con un schema viejo/incompleto), la añadimos
  // y dejamos la foreign key apuntando a usuarios.
  const [colsReparaciones] = await pool.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'reparaciones' AND COLUMN_NAME = 'usuario_id'`,
    [DB_NAME]
  );
  if (colsReparaciones.length === 0) {
    console.warn('La tabla `reparaciones` no tiene la columna `usuario_id`; la estoy agregando.');
    await pool.query(`ALTER TABLE reparaciones ADD COLUMN usuario_id INT(11) NOT NULL AFTER id`);
    await pool.query(`ALTER TABLE reparaciones ADD KEY usuario_id (usuario_id)`);
    try {
      await pool.query(`
        ALTER TABLE reparaciones
        ADD CONSTRAINT reparaciones_ibfk_1
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      `);
    } catch (e) {
      // Si ya existía la FK con ese nombre o falla por otro motivo, no abortamos.
      console.warn('No se pudo agregar la FK reparaciones_ibfk_1 (puede que ya exista):', e.message);
    }
  }

  // Auto-migración: si una BD antigua no tiene `servicio_id` en reparaciones, la añadimos
  const [colsServicioId] = await pool.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'reparaciones' AND COLUMN_NAME = 'servicio_id'`,
    [DB_NAME]
  );
  if (colsServicioId.length === 0) {
    await pool.query(`ALTER TABLE reparaciones ADD COLUMN servicio_id INT(11) DEFAULT NULL AFTER usuario_id`);
    await pool.query(`ALTER TABLE reparaciones ADD KEY servicio_id (servicio_id)`);
    try {
      await pool.query(`
        ALTER TABLE reparaciones
        ADD CONSTRAINT fk_reparacion_servicio
        FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE SET NULL
      `);
    } catch (e) {
      console.warn('No se pudo agregar la FK fk_reparacion_servicio:', e.message);
    }
  }

  // Sembrar el catálogo de servicios si está vacío
  const [conteoServicios] = await pool.query('SELECT COUNT(*) AS n FROM servicios');
  if (conteoServicios[0].n === 0) {
    await pool.query(`
      INSERT INTO servicios (nombre, descripcion, categoria, precio, dias_estimados, activo) VALUES
      ('Reparación de pantalla', 'Cambio de pantalla o módulo dañado.', 'Teléfono', 50000, 2, 1),
      ('Reparación de pantalla', 'Cambio de panel para notebook.', 'Computador', 60000, 3, 1),
      ('Cambio de batería', 'Reemplazo de batería degradada.', 'Teléfono', 80000, 1, 1),
      ('Cambio de batería', 'Reemplazo de batería de notebook.', 'Computador', 100000, 2, 1),
      ('Reparación de placa', 'Reparación de placa o circuito dañado.', 'General', 120000, 4, 1),
      ('Reparación de botones', 'Reparación de botones o teclado.', 'General', 70000, 2, 1),
      ('Diagnóstico general', 'Revisión técnica y diagnóstico del equipo.', 'General', 15000, 1, 1),
      ('Formateo e instalación', 'Reinstalación de sistema y programas.', 'Computador', 30000, 1, 1)
    `);
    console.log('[db] Catálogo de servicios sembrado');
  }
}

async function probarConexion() {
  try {
    await asegurarEstructura();
    const conexion = await pool.getConnection();
    console.log(`Conectado a MySQL (XAMPP) correctamente — BD: ${DB_NAME}`);
    conexion.release();
    return true;
  } catch (error) {
    console.error('Error al conectar a MySQL:', error.message);
    console.error('Verifica que XAMPP esté corriendo (MySQL iniciado)');
    console.error('Host:', baseConfig.host, 'Puerto:', baseConfig.port, 'Usuario:', baseConfig.user);
    return false;
  }
}

module.exports = { pool, probarConexion };