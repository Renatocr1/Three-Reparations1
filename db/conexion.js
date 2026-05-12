// ============================================
// Conexión a MySQL (XAMPP)
// Archivo: db/conexion.js
// ============================================
const mysql = require('mysql2/promise');

const configDB = {
  host: 'localhost',
  user: 'root',       // Usuario por defecto de XAMPP
  password: '',       // Contraseña vacía por defecto
  database: 'integracion1',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10
};

// Pool de conexiones compartido
const pool = mysql.createPool(configDB);

// Probar conexión al iniciar
async function probarConexion() {
  try {
    const conexion = await pool.getConnection();
    console.log('Conectado a MySQL (XAMPP) correctamente');
    conexion.release();
    return true;
  } catch (error) {
    console.error('Error al conectar a MySQL:', error.message);
    console.error('Verifica que XAMPP esté corriendo (MySQL iniciado)');
    return false;
  }
}

module.exports = { pool, probarConexion };
