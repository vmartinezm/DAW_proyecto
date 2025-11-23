// src/middlewares/auth.middleware.js
import jwt from "jsonwebtoken";

/**
 * Obtiene el secreto JWT desde variables de entorno.
 * En desarrollo usa un valor por defecto si no está definido.
 */
const JWT_SECRET = process.env.JWT_SECRET || "desarrollo_super_secreto";


/**
 * Verifica que el token JWT sea válido y esté asociado a una sesión de usuario.
 * En caso de error, devuelve un objeto JSON con el error correspondiente.
 * Si el token es válido, guarda información útil del usuario en la request.
 * @param {Object} req - objeto Request de Express
 * @param {Object} res - objeto Response de Express
 * @param {Function} next - función middleware siguiente a ejecutar
 */
export function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    // Guardamos info útil del usuario en la request
    req.user = {
      user_id: payload.user_id,
      usuario: payload.usuario,
      rol: payload.rol,
    };

    next();
  } catch (err) {
    console.error("Error al verificar token:", err);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expirado, vuelve a iniciar sesión" });
    }

    return res.status(401).json({ error: "Token inválido" });
  }
}


/**
 * Middleware que verifica si el usuario autenticado tiene el rol necesario para acceder a una ruta.
 * Se pasa un número variable de roles como argumentos, y se verifica si el usuario tiene alguno de ellos.
 * Si no tiene el rol necesario, devuelve un objeto JSON con un error de acceso denegado.
 * Si el usuario no tiene una sesión activa, devuelve un objeto JSON con un error interno.
 * @param {...string} roles - roles necesarios para acceder a la ruta
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      // Si llegamos aquí sin user, algo va mal en verifyToken
      return res.status(500).json({ error: "Usuario no disponible en la petición" });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: "No tienes permisos para realizar esta acción" });
    }

    next();
  };
}

/**
 * Middleware específico para exigir rol administrador.
 * Equivalente a requireRole("admin").
 */
export const requireAdmin = requireRole("admin");