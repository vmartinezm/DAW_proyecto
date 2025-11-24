/**
 * @file mantenimientos.validator.js
 * @description Middlewares para validar los datos de mantenimientos antes de crear o editar.
 * @module middlewares/validators/mantenimientos.validator
 */

// Importar la conexión a la base de datos
import connection from "../../config/db.js";

// Importar utilidades para promisificar consultas
import { promisify } from "util";

// Promisificar la función de consulta de la base de datos
const queryAsync = promisify(connection.query).bind(connection);

/**
 * @function validarFechaISO -
 * @description Comprueba si una fecha cumple con formato ISO yyyy-mm-dd
 * @param {string} f - cadenas de fecha
 * @returns {boolean} True si el formato es correcto
 */
function validarFechaISO(f) {
  return /^\d{4}-\d{2}-\d{2}$/.test(f);
}

/**
 * @function existeUsuario
 * @description Comprueba si un usuario existe en la base de datos.
 * @param {number|string} id - user_id del usuario
 * @returns {Promise<boolean>} True si el usuario existe, false en caso contrario
 */
async function existeUsuario(id) {
  const r = await queryAsync("SELECT user_id FROM usuarios WHERE user_id = ?", [
    id,
  ]);
  return r.length > 0;
}

/**
 * @function existeVehiculo
 * @description Comprueba si un vehículo existe en la base de datos
 * @param {string} matricula - matrícula del vehículo
 * @returns {Promise<boolean>} True si el vehículo existe, false en caso contrario
 */
async function existeVehiculo(matricula) {
  const r = await queryAsync(
    "SELECT matricula FROM vehiculos WHERE matricula = ?",
    [matricula]
  );
  return r.length > 0;
}

/**
 * @function validarMantenimiento
 * @description Middleware para validar un mantenimiento antes de crear o editar.
 * Valida los datos del mantenimiento: vehículo, fecha de inicio, fecha de fin, descripción, coste y empleado asociado.
 * Comprueba que el vehículo, empleado y usuario existen.
 * Comprueba que la fecha de inicio y fin sean válidas.
 * Comprueba que el coste sea un número mayor que 0.
 * Comprueba que el vehículo no esté vendido ni en mantenimiento en caso de crear.
 * Comprueba que el vehículo no esté reservado en caso de crear.
 * @param {object} req - Objeto de solicitud de Express
 * @param {object} res - Objeto de respuesta de Express
 * @param {function} next - Función para pasar al siguiente middleware
 * @returns {void|JSON} Llama a next() si todo es correcto, o devuelve un error 400 con el mensaje de error
 * @throws {400} Error de validación de datos
 */
export async function validarMantenimiento(req, res, next) {
  const {
    vehiculo_id,
    fecha_inicio,
    fecha_fin,
    descripcion,
    coste,
    realizado_por,
  } = req.body;

  if (!vehiculo_id)
    return res.status(400).json({ error: "Vehículo obligatorio" });
  if (!(await existeVehiculo(vehiculo_id))) {
    return res.status(400).json({ error: "El vehículo no existe" });
  }

  const estado = await queryAsync(
    "SELECT estado FROM vehiculos WHERE matricula = ?",
    [vehiculo_id]
  );

  if (estado[0].estado === "vendido") {
    return res
      .status(400)
      .json({
        error: "No puedes realizar mantenimiento a un vehículo vendido",
      });
  }

  if (!fecha_inicio || !validarFechaISO(fecha_inicio)) {
    return res.status(400).json({ error: "La fecha de inicio no es válida" });
  }

  if (fecha_fin) {
    if (!validarFechaISO(fecha_fin)) {
      return res.status(400).json({ error: "La fecha de fin no es válida" });
    }
    if (fecha_fin < fecha_inicio) {
      return res
        .status(400)
        .json({
          error: "La fecha de fin no puede ser anterior a la de inicio",
        });
    }
  }

  if (coste && coste < 0) {
    return res.status(400).json({ error: "El coste no puede ser negativo" });
  }

  if (!realizado_por || !(await existeUsuario(realizado_por))) {
    return res
      .status(400)
      .json({ error: "Debe especificarse un empleado válido" });
  }

  const mActivos = await queryAsync(
    "SELECT mantenimiento_id FROM mantenimientos WHERE vehiculo_id = ? AND fecha_fin IS NULL",
    [vehiculo_id]
  );

  if (mActivos.length > 0) {
    return res
      .status(400)
      .json({ error: "El vehículo ya tiene un mantenimiento activo" });
  }

  next();
}

/**
 * @function validarMantenimientoEdicion
 * @description Middleware para validar un mantenimiento antes de editar.
 * Valida los datos de mantenimiento antes de editar y actualiza
 * los datos del mantenimiento correspondientes a la edición.
 * Valida la fecha de inicio y fin, coste y empleado asociado.
 * @param {object} req - Objeto de solicitud de Express
 * @param {object} res - Objeto de respuesta de Express
 * @param {function} next - Función para pasar al siguiente middleware
 * @returns {void|JSON} Llama a next() si todo es correcto, o devuelve un error 400 con el mensaje de error
 * @throws {400} Error de validación de datos
 */
export async function validarMantenimientoEdicion(req, res, next) {
  const { mantenimiento_id } = req.params;
  const { fecha_inicio, fecha_fin, coste, realizado_por } = req.body;

  if (!mantenimiento_id) {
    return res.status(400).json({ error: "ID de mantenimiento requerido" });
  }

  if (fecha_inicio && !validarFechaISO(fecha_inicio)) {
    return res.status(400).json({ error: "Fecha de inicio inválida" });
  }

  if (fecha_fin) {
    if (!validarFechaISO(fecha_fin)) {
      return res.status(400).json({ error: "Fecha de fin inválida" });
    }
    if (fecha_inicio && fecha_fin < fecha_inicio) {
      return res
        .status(400)
        .json({
          error: "La fecha de fin no puede ser anterior a la de inicio",
        });
    }
  }

  if (coste && coste < 0) {
    return res.status(400).json({ error: "El coste no puede ser negativo" });
  }

  if (realizado_por && !(await existeUsuario(realizado_por))) {
    return res.status(400).json({ error: "Empleado asignado no existe" });
  }

  next();
}
