/**
 * @file src/middlewares/validators/ventas.validator.js
 * @description Middlewares de validación para las rutas de ventas y reservas
 * @module middlewares/validators/ventas.validator
 */

// Importar la conexión a la base de datos
import connection from "../../config/db.js";

// Utilidad para usar promesas con consultas SQL
import { promisify } from "util";

// Promisificar el método query de la conexión
const queryAsync = promisify(connection.query).bind(connection);

/**
 * @function validarFechaISO
 * @description Verifica si una fecha cumple con formato ISO yyyy-mm-dd
 * @param {string} f - Cadena de fecha
 * @returns {boolean} True si el formato es correcto
 */
function validarFechaISO(f) {
  return /^\d{4}-\d{2}-\d{2}$/.test(f);
}

/**
 * @function existeCliente
 * @description Comprueba si un cliente existe en la base de datos
 * @param {string} dni - DNI del cliente
 * @returns {Promise<boolean>} True si el cliente existe, false en caso contrario
 */
async function existeCliente(dni) {
  const r = await queryAsync("SELECT dni FROM clientes WHERE dni = ?", [dni]);
  return r.length > 0;
}

/**
 * @function existeUsuario
 * @description Comprueba si un usuario existe en la base de datos.
 * @param {number|string} id - user_id del empleado
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
 * @param {string} matricula Matrícula del vehículo
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
 * @function estadoVehiculo
 * @description Comprueba y devuelve el estado actual de un vehículo
 * @param {string} matricula Matrícula del vehículo
 * @returns {Promise<string|null>} Estado actual del vehículo o null si no existe
 */
async function estadoVehiculo(matricula) {
  const r = await queryAsync(
    "SELECT estado FROM vehiculos WHERE matricula = ?",
    [matricula]
  );
  return r.length > 0 ? r[0].estado : null;
}

/**
 * @function validarVenta
 * @description Middleware de validación para crear o editar una venta o reserva.
 * Valida los datos de la venta: vehículo, cliente, fecha, tipo, precio_venta y vendedor_id.
 * Comprueba que el vehículo, cliente y vendedor existen.
 * Comprueba que la fecha es válida.
 * Comprueba que el tipo sea 'venta' o 'reserva'.
 * Comprueba que el precio_venta sea un número mayor que 0.
 * Comprueba que el vehículo no esté vendido ni en mantenimiento en caso de venta.
 * Comprueba que el vehículo no esté reservado en caso de reserva.
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para pasar al siguiente middleware
 * @returns {void|JSON} Llama a next() si todo es correcto, o devuelve un error 400 con el mensaje de error
 * @throws {400} Error de validación con el mensaje correspondiente
 */
export async function validarVenta(req, res, next) {
  const { vehiculo_id, cliente_dni, fecha, tipo, precio_venta, vendedor_id } =
    req.body;

  if (!vehiculo_id || !(await existeVehiculo(vehiculo_id))) {
    return res.status(400).json({ error: "Debe indicarse un vehículo válido" });
  }

  if (!cliente_dni || !(await existeCliente(cliente_dni))) {
    return res.status(400).json({ error: "Debe indicarse un cliente válido" });
  }

  if (!vendedor_id || !(await existeUsuario(vendedor_id))) {
    return res.status(400).json({ error: "Debe indicarse un vendedor válido" });
  }

  if (!fecha || !validarFechaISO(fecha)) {
    return res.status(400).json({ error: "La fecha no es válida" });
  }

  if (!["venta", "reserva"].includes(tipo)) {
    return res
      .status(400)
      .json({ error: "El tipo debe ser 'venta' o 'reserva'" });
  }

  if (precio_venta == null || isNaN(precio_venta) || precio_venta <= 0) {
    return res
      .status(400)
      .json({ error: "El precio debe ser un número mayor que 0" });
  }

  const estado = await estadoVehiculo(vehiculo_id);

  if (estado === "vendido") {
    return res.status(400).json({ error: "El vehículo ya está vendido" });
  }
  if (estado === "mantenimiento" && tipo === "venta") {
    return res
      .status(400)
      .json({ error: "No se puede vender un vehículo en mantenimiento" });
  }
  if (estado === "reservado" && tipo === "reserva") {
    return res.status(400).json({ error: "El vehículo ya está reservado" });
  }

  next();
}

/**
 * @function validarVentaEdicion
 * @description  Middleware para validar una venta o reserva cuando se va a EDITAR (PUT).
 * Valida los datos de la venta: fecha, tipo, precio_venta y vendedor_id.
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para pasar al siguiente middleware
 * @returns {void|JSON} Llama a next() si todo es correcto, o devuelve un error 400 con el mensaje de error
 * @throws {400} Error de validación con el mensaje correspondiente
 */
export async function validarVentaEdicion(req, res, next) {
  const { fecha, tipo, precio_venta, vendedor_id } = req.body;

  if (fecha && !validarFechaISO(fecha)) {
    return res.status(400).json({ error: "La fecha no es válida" });
  }

  if (tipo && !["venta", "reserva"].includes(tipo)) {
    return res
      .status(400)
      .json({ error: "El tipo debe ser 'venta' o 'reserva'" });
  }

  if (precio_venta != null && (isNaN(precio_venta) || precio_venta <= 0)) {
    return res
      .status(400)
      .json({ error: "El precio debe ser un número mayor que 0" });
  }

  if (vendedor_id && !(await existeUsuario(vendedor_id))) {
    return res.status(400).json({ error: "Debe indicarse un vendedor válido" });
  }

  next();
}
