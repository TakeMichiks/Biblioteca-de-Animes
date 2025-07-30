const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // 'Bearer token'

  if (!token) {
    return res.status(401).json({ error: 'Token malformed' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;; // Guardamos el id del usuario para usarlo luego si quieres
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
function validarAnime(req, res, next) {
  const {
    titulo,
    descripcion,
    portada,
    episodios,
    estado,
    calificacion,
    notas,
    capVistos,
    capTotales
  } = req.body;

  if (!titulo || typeof titulo !== 'string' || titulo.trim() === '') {
    return res.status(400).json({ error: 'Título requerido y debe ser texto no vacío' });
  }

  if (!portada || typeof portada !== 'string' || portada.trim() === '') {
    return res.status(400).json({ error: 'Portada requerida y debe ser URL válida' });
  }

  const estadosValidos = ['Viendo', 'Completado', 'Pendiente', 'Abandonado'];
  if (!estado || !estadosValidos.includes(estado)) {
    return res.status(400).json({ error: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}` });
  }

  if (typeof episodios !== 'number' || episodios < 0) {
    return res.status(400).json({ error: 'Episodios debe ser un número mayor o igual a 0' });
  }

  if (typeof capVistos !== 'number' || capVistos < 0) {
    return res.status(400).json({ error: 'Capítulos vistos debe ser un número mayor o igual a 0' });
  }

  if (typeof capTotales !== 'number' || capTotales < 0) {
    return res.status(400).json({ error: 'Capítulos totales debe ser un número mayor o igual a 0' });
  }

  if (capVistos > capTotales) {
    return res.status(400).json({ error: 'Los capítulos vistos no pueden ser mayores que los capítulos totales' });
  }

  // Puedes agregar validaciones para calificacion, notas y descripcion si quieres.

  next();
}

module.exports = authMiddleware;
