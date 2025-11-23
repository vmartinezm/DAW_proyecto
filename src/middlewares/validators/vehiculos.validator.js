/**
 * Vehículos Validator Module
 * Contiene validadores especializados para altas y modificaciones de vehículos.
 * @module vehiculos.validator
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
 * Middleware para validar un vehículo cuando se va a EDITAR (PUT).
 * ❗ La matrícula NO se valida ni se exige en el body,
 * ya que viene en req.params.matricula y no es editable.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export function validarVehiculoPUT(req, res, next) {
  const { marca, modelo, ano, kilometros, precio } = req.body;

  if (marca && marca.length < 2) {
    return res.status(400).json({
      error: "La marca del vehículo no puede ser tan corta",
    });
  }

  if (modelo && modelo.length < 1) {
    return res.status(400).json({
      error: "El modelo del vehículo no puede estar vacío",
    });
  }

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

  if (kilometros && kilometros < 0) {
    return res.status(400).json({
      error: "Los kilómetros no pueden ser negativos",
    });
  }

  if (precio && precio < 0) {
    return res.status(400).json({
      error: "El precio no puede ser negativo",
    });
  }

  next();
}