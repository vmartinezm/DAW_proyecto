/**
 * @file usuarios.validator.js
 * @description Middleware de validación para creación y edición de usuarios.
 * Verifica que los datos enviados en las solicitudes sean correctos y completos.
 * @module middlewares/validators/usuarios.validator
 */

// Importar dependencias necesarias
import connection from "../../config/db.js";
import { promisify } from "util";

// Promisificar el método query para usar async/await
const queryAsync = promisify(connection.query).bind(connection);

/**
 * @function validarEmail
 * @description Comprueba si un email tiene formato válido.
 * @param {string} correo - email a validar
 * @returns {boolean} true si el email es válido, false en caso contrario
 */
function validarEmail(correo) {
  return /^\S+@\S+\.\S+$/.test(correo);
}

/**
 * @function validarUsuarioCreacion
 * @description Middleware de validación para creación de usuarios.
 * Verifica que se envíen todos los campos necesarios y que tengan un formato válido.
 * Revisa que el usuario y email no estén ya en uso.
 * Si se encuentra un error, se devuelve un objeto JSON con el error correspondiente.
 * @param {Object} req - objeto Request de Express
 * @param {Object} res - objeto Response de Express
 * @param {Function} next - función middleware siguiente a ejecutar
 * @return {void}
 * @throws {400} Error de validación de datos
 * @throws {500} Error interno del servidor
 */
export async function validarUsuarioCreacion(req, res, next) {
  const { nombre, apellidos, usuario, rol, email, password } = req.body;

  if (!nombre || nombre.length < 2) {
    return res
      .status(400)
      .json({ error: "El nombre es obligatorio (min. 2 letras)" });
  }
  if (!apellidos || apellidos.length < 2) {
    return res
      .status(400)
      .json({ error: "Los apellidos son obligatorios (min. 2 letras)" });
  }

  if (!usuario || usuario.length < 2) {
    return res.status(400).json({ error: "El usuario es obligatorio" });
  }

  if (!email || !validarEmail(email)) {
    return res.status(400).json({ error: "El email no es válido" });
  }

  if (!rol || !["admin", "empleado"].includes(rol)) {
    return res
      .status(400)
      .json({ error: "El rol debe ser 'admin' o 'empleado'" });
  }

  if (!password || password.trim().length < 4) {
    return res
      .status(400)
      .json({ error: "La contraseña es obligatoria (mín 4 caracteres)" });
  }

  try {
    const uExiste = await queryAsync(
      "SELECT usuario FROM usuarios WHERE usuario = ?",
      [usuario]
    );
    if (uExiste.length > 0) {
      return res.status(400).json({ error: "Ese nombre de usuario ya existe" });
    }

    const eExiste = await queryAsync(
      "SELECT email FROM usuarios WHERE email = ?",
      [email]
    );
    if (eExiste.length > 0) {
      return res.status(400).json({ error: "Ese email ya está registrado" });
    }
  } catch (err) {
    console.error("Error validando usuario:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }

  next();
}

/**
 * @function validarUsuarioEdicion
 * @description Middleware de validación para edición de usuarios.
 * Verifica que se envíen todos los campos necesarios y que tengan un formato válido.
 * Revisa que el usuario y email no estén ya en uso por otro usuario.
 * Si se encuentra un error, se devuelve un objeto JSON con el error correspondiente.
 * @param {Object} req - objeto Request de Express
 * @param {Object} res - objeto Response de Express
 * @param {Function} next - función middleware siguiente a ejecutar
 * @return {void}
 * @throws {400} Error de validación de datos
 * @throws {500} Error interno del servidor
 */
export async function validarUsuarioEdicion(req, res, next) {
  const { user_id } = req.params;
  const { nombre, apellidos, usuario, rol, email, password } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "ID de usuario requerido" });
  }

  if (!nombre || nombre.length < 2) {
    return res.status(400).json({ error: "El nombre es obligatorio" });
  }
  if (!apellidos || apellidos.length < 2) {
    return res.status(400).json({ error: "Los apellidos son obligatorios" });
  }

  if (!usuario || usuario.length < 2) {
    return res.status(400).json({ error: "El usuario es obligatorio" });
  }

  if (!email || !validarEmail(email)) {
    return res.status(400).json({ error: "El email no es válido" });
  }

  if (!rol || !["admin", "empleado"].includes(rol)) {
    return res
      .status(400)
      .json({ error: "El rol debe ser 'admin' o 'empleado'" });
  }

  if (password && password.trim().length < 4) {
    return res
      .status(400)
      .json({ error: "La contraseña debe tener mínimo 4 caracteres" });
  }

  try {
    const uExiste = await queryAsync(
      "SELECT user_id FROM usuarios WHERE usuario = ? AND user_id != ?",
      [usuario, user_id]
    );
    if (uExiste.length > 0) {
      return res
        .status(400)
        .json({ error: "Ese nombre de usuario ya está en uso" });
    }

    const eExiste = await queryAsync(
      "SELECT user_id FROM usuarios WHERE email = ? AND user_id != ?",
      [email, user_id]
    );
    if (eExiste.length > 0) {
      return res
        .status(400)
        .json({ error: "Ese email ya está en uso por otro usuario" });
    }
  } catch (err) {
    console.error("Error validando usuario:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }

  next();
}
