/**
 * Middleware de validación para creación y edición de clientes
 */

import connection from "../../config/db.js";
import { promisify } from "util";

const queryAsync = promisify(connection.query).bind(connection);

/**
 * Calcula la letra correcta para un DNI o NIE
 */
function calcularLetraDNI(identificacion) {
  let numero = identificacion.toUpperCase();

  if (numero.startsWith("X")) numero = numero.replace("X", "0");
  else if (numero.startsWith("Y")) numero = numero.replace("Y", "1");
  else if (numero.startsWith("Z")) numero = numero.replace("Z", "2");

  numero = numero.slice(0, -1);

  const letras = "TRWAGMYFPDXBNJZSQVHLCKE";
  return letras[numero % 23]; 
}

/**
 * Valida si un DNI o NIE es válido.
 * @param {string} dni DNI o NIE a validar
 * @returns {boolean} Verdadero si el DNI o NIE es válido
 */
function validarDNI_o_NIE(dni) {
  if (!dni) return false;
  dni = dni.toUpperCase();

  if (!/^[XYZ]?\d{7,8}[A-Z]$/.test(dni)) return false;

  const letraCorrecta = calcularLetraDNI(dni);
  return dni.endsWith(letraCorrecta);
}

// ==========================================================
//  VALIDACIÓN PARA CREAR CLIENTE (POST)
// ==========================================================
/**
 * Valida un cliente para su creación.
 *
 * @function validarCliente
 * @description Valida los datos del cliente para su creación. Verifica si el DNI o NIE es válido, si el nombre tiene al menos 2 caracteres y si el número de teléfono tiene exactamente 9 dígitos.
 * @route POST /clientes
 * @param {Object} req - El objeto de solicitud.
 * @param {Object} res - El objeto de respuesta.
 * @param {Function} next - La siguiente función middleware.
 * @returns {void}
 * @throws {Object} - Devuelve un objeto JSON con un mensaje de error si alguna de las validaciones falla.
 */
export async function validarCliente(req, res, next) {
  const { dni, nombre, apellidos, email, telefono } = req.body;

  if (!validarDNI_o_NIE(dni)) {
    return res.status(400).json({ error: "El DNI o NIE no es válido" });
  }

  if (!nombre || nombre.length < 2) {
    return res.status(400).json({ error: "El nombre es obligatorio (mín 2 letras)" });
  }

  if (!apellidos || apellidos.length < 2) {
    return res.status(400).json({ error: "Los apellidos son obligatorios (mín 2 letras)" });
  }

  if (!telefono || !/^\d{9}$/.test(telefono)) {
    return res.status(400).json({ error: "El teléfono debe tener exactamente 9 números" });
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: "El email no es válido" });
  }

  try {
    const dniExiste = await queryAsync("SELECT dni FROM clientes WHERE dni = ?", [dni]);
    if (dniExiste.length > 0) {
      return res.status(400).json({ error: "Ese DNI ya está registrado" });
    }

    const mailExiste = await queryAsync("SELECT email FROM clientes WHERE email = ?", [email]);
    if (mailExiste.length > 0) {
      return res.status(400).json({ error: "Ese email ya está registrado" });
    }

  } catch (err) {
    console.error("Error validando cliente:", err);
    return res.status(500).json({ error: "Error interno validando cliente" });
  }

  next();
}


// ==========================================================
//  VALIDACIÓN PARA EDITAR CLIENTE (PUT)
// ==========================================================

export async function validarClienteEdicion(req, res, next) {
  const { dni } = req.params;
  const { nombre, apellidos, email, telefono } = req.body;

  // En edición: el DNI se usa solo internamente (en la URL) pero NO se valida ni se permite cambiar.
  // Si llega dni en el body, lo ignoramos silenciosamente.
  if (req.body.dni) {
    delete req.body.dni;
  }

  // (Opcional, pero recomendable) Si por lo que sea no viene en la ruta:
  if (!dni) {
    return res.status(400).json({ error: "Falta el DNI del cliente en la URL" });
  }

  // Nombre / Apellidos
  if (!nombre || nombre.length < 2) {
    return res.status(400).json({ error: "El nombre es obligatorio" });
  }
  if (!apellidos || apellidos.length < 2) {
    return res.status(400).json({ error: "Los apellidos son obligatorios" });
  }

  // Teléfono
  if (!telefono || !/^\d{9}$/.test(telefono)) {
    return res.status(400).json({ error: "El teléfono debe tener 9 números" });
  }

  // Email válido
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: "El email no es válido" });
  }

  // Verificación de duplicado de email — excluyendo el propio cliente (por DNI en URL)
  try {
    const mailExiste = await queryAsync(
      "SELECT email FROM clientes WHERE email = ? AND dni != ?",
      [email, dni]
    );

    if (mailExiste.length > 0) {
      return res
        .status(400)
        .json({ error: "Ese email ya está registrado por otro cliente" });
    }
  } catch (err) {
    console.error("Error validando cliente:", err);
    return res.status(500).json({ error: "Error interno validando cliente" });
  }

  return next();
}