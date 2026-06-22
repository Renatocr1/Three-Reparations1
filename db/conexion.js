// ============================================
// Conexión a MySQL (XAMPP) — db/conexion.js
// ============================================
const mysql = require('mysql2/promise');

const DB_NAME = 'integracion1';

const baseConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  port: 3306,
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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reparaciones (
      id INT(11) NOT NULL AUTO_INCREMENT,
      usuario_id INT(11) NOT NULL,
      equipo VARCHAR(150) NOT NULL,
      descripcion TEXT NOT NULL,
      estado ENUM('pendiente','en_proceso','listo','entregado','cancelado') NOT NULL DEFAULT 'pendiente',
      creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY usuario_id (usuario_id),
      CONSTRAINT reparaciones_ibfk_1 FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
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