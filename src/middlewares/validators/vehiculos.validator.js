/**
 * @file vehiculos.validator.js
 * @description Middleware de validación para vehículos. Contiene validadores especializados para altas y modificaciones de vehículos.
 * @module vehiculos.validator
 */


/**
 * @function validarVehiculoPOST
 * @description Middleware de validación para crear un vehículo.
 * Valida los datos de la solicitud:
 *   - matrícula: debe tener el formato 0000AAA (4 números + 3 consonantes en mayúsculas)
 *   - marca: debe tener al menos 2 caracteres
 *   - modelo: debe tener al menos 1 carácter
 *   - año: debe ser numérico y estar entre 1950 y 2099
 *   - kilómetros: no puede ser negativo
 *   - precio: no puede ser negativo
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @param {Function} next - Función para pasar al siguiente middleware.
 * @returns {void|Object} Devuelve un 400 con un mensaje de error si hay errores de validación, o llama a next() si no hay errores.
 * @throws {Object} Lanza un error 400 si la validación falla.
 */
export function validarVehiculoPOST(req, res, next) {
  const { matricula, marca, modelo, ano, kilometros, precio } = req.body;

  // =============================
  // Validación de matrícula española moderna (0000-AAA)
  // =============================
  if (!matricula || !/^\d{4}[BCDFGHJKLMNPQRSTVWXYZ]{3}$/.test(matricula)) {
    return res.status(400).json({
      error:
        "La matrícula debe tener el formato 0000AAA (4 números + 3 consonantes en mayúsculas)",
    });
  }

  // =============================
  // Validación de marca
  // =============================
  if (!marca || marca.length < 2) {
    return res.status(400).json({
      error: "La marca del vehículo es obligatoria",
    });
  }

  // =============================
  // Validación de modelo
  // =============================
  if (!modelo || modelo.length < 1) {
    return res.status(400).json({
      error: "El modelo del vehículo es obligatorio",
    });
  }

  // =============================
  // Validación del año
  // =============================
  if (ano) {
    if (isNaN(ano)) {
      return res.status(400).json({ error: "El año debe ser numérico" });
    }
    if (ano < 1950 || ano > 2099) {
      return res.status(400).json({
        error: "El año debe estar entre 1950 y 2099",
      });
    }
  }

  // =============================
  // Validación de kilómetros
  // =============================
  if (kilometros && kilometros < 0) {
    return res.status(400).json({
      error: "Los kilómetros no pueden ser negativos",
    });
  }

  // =============================
  // Validación de precio
  // =============================
  if (precio && precio < 0) {
    return res.status(400).json({
      error: "El precio no puede ser negativo",
    });
  }

  next();
}


/**
 * @function validarVehiculoPUT
 * @description Middleware de validación para actualizar un vehículo.
 * Valida los datos de la solicitud:
 *   - marca: debe tener al menos 2 caracteres
 *   - modelo: debe tener al menos 1 carácter
 *   - año: debe ser numérico y estar entre 1950 y 2099
 *   - kilómetros: no puede ser negativo
 *   - precio: no puede ser negativo
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @param {Function} next - Función para pasar al siguiente middleware.
 * @returns {void|Object} Devuelve un 400 con un mensaje de error si hay errores de validación, o llama a next() si no hay errores.
 * @throws {Object} Lanza un error 400 si la validación falla.
 */
export function validarVehiculoPUT(req, res, next) {
  const { marca, modelo, ano, kilometros, precio } = req.body;

  // =============================
  // Validación de marca
  // =============================
  if (marca && marca.length < 2) {
    return res.status(400).json({
      error: "La marca del vehículo no puede ser tan corta",
    });
  }

  // =============================
  // Validación de modelo
  // =============================
  if (modelo && modelo.length < 1) {
    return res.status(400).json({
      error: "El modelo del vehículo no puede estar vacío",
    });
  }

  // =============================
  // Validación del año
  // =============================
  if (ano) {
    if (isNaN(ano)) {
      return res.status(400).json({ error: "El año debe ser numérico" });
    }
    if (ano < 1950 || ano > 2099) {
      return res.status(400).json({
        error: "El año debe estar entre 1950 y 2099",
      });
    }
  }

  // =============================            
  // Validación de kilómetros
  // =============================
  if (kilometros && kilometros < 0) {
    return res.status(400).json({
      error: "Los kilómetros no pueden ser negativos",
    });
  }

  // =============================
  // Validación de precio
  // =============================
  if (precio && precio < 0) {
    return res.status(400).json({
      error: "El precio no puede ser negativo",
    });
  }

  next();
}