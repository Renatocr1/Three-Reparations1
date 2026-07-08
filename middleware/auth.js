// ============================================
// Middleware de control de acceso por rol
// Archivo: middleware/auth.js
// Usa la sesión (express-session) que se crea en el login.
// ============================================

// Exige que haya un usuario con sesión iniciada.
function soloAutenticado(req, res, next) {
  if (req.session && req.session.usuario) return next();
  return res.status(401).json({ error: 'Debes iniciar sesión' });
}

// Exige que el usuario de la sesión sea administrador.
function soloAdmin(req, res, next) {
  if (req.session && req.session.usuario && req.session.usuario.rol === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Acceso restringido a administradores' });
}

module.exports = { soloAutenticado, soloAdmin };
