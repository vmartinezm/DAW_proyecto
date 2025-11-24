/** 
 * @file src/controllers/vehiculos.controller.js
 * @description Controlador para la gestión de vehículos.
 * @module controllers/vehiculos.controller
*/

// Importar la conexión a la base de datos
import connection from "../config/db.js";

/**
 * @function obtenerVehiculos
 * @description Obtiene todos los vehículos de la base de datos.
 * @route GET /vehiculos
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @returns {JSON} Lista de vehículos
 * @throws {500} Error al obtener vehículos
 */
export const obtenerVehiculos = (req, res) => {
  const sql = "SELECT * FROM vehiculos";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener vehículos:", err);
      return res.status(500).json({ error: "Error al obtener vehículos" });
    }
    return res.status(200).json(results);
  });
};

/**
 * @function obtenerVehiculoPorMatricula
 * @description Obtiene un vehículo según su matrícula.
 * @route GET /vehiculos/:matricula
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @returns {JSON} Vehículo encontrado
 * @throws {404} Vehículo no encontrado
 * @throws {500} Error al obtener vehículo
 */
export const obtenerVehiculoPorMatricula = (req, res) => {
  const { matricula } = req.params;

  const sql = "SELECT * FROM vehiculos WHERE matricula = ?";
  connection.query(sql, [matricula], (err, results) => {
    if (err) {
      console.error("Error al obtener vehículo:", err);
      return res.status(500).json({ error: "Error al obtener vehículo" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    return res.json(results[0]);
  });
};

/**
 * @function anadirVehiculo
 * @description Crea un nuevo vehículo en la base de datos.
 * @route POST /vehiculos
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @returns {JSON} Mensaje de éxito o error
 * @throws {400} Faltan campos obligatorios
 * @throws {400} Ya existe un vehículo con esa matrícula
 * @throws {500} Error al insertar vehículo
 */
export const anadirVehiculo = (req, res) => {
  const {
    matricula,
    marca,
    modelo,
    version,
    color,
    ano,
    kilometros,
    combustible,
    precio,
    estado,
  } = req.body;

  if (!matricula || !marca || !modelo) {
    return res.status(400).json({ error: "Faltan campos obligatorios: matricula, marca o modelo" });
  }

  const sql = `
    INSERT INTO vehiculos (matricula, marca, modelo, version, color, ano, kilometros, combustible, precio, estado)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    matricula,
    marca,
    modelo,
    version,
    color,
    ano,
    kilometros,
    combustible,
    precio,
    estado,
  ];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error al insertar vehículo:", err.sqlMessage || err.message);
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "Ya existe un vehículo con esa matrícula" });
      }
      return res.status(500).json({ error: "Error al insertar vehículo" });
    }

    return res.status(201).json({
      mensaje: "Vehículo añadido correctamente",
      matricula: matricula,
    });
  });
};

/**
 * @function actualizarVehiculo
 * @description Actualiza la información de un vehículo según matrícula.
 * @route PUT /vehiculos/:matricula
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @returns {JSON} Mensaje de éxito o error
 * @throws {404} Vehículo no encontrado
 * @throws {500} Error al actualizar vehículo
 * @throws {400} Ya existe un vehículo con esa matrícula
 */
export const actualizarVehiculo = (req, res) => {
  const { matricula } = req.params;
  const { marca, modelo, version, color, ano, kilometros, combustible, precio, estado } = req.body;

  const sql = `
    UPDATE vehiculos
    SET marca = ?, modelo = ?, version = ?, color = ?, ano = ?, kilometros = ?, combustible = ?, precio = ?, estado = ?
    WHERE matricula = ?
  `;
  const values = [marca, modelo, version, color, ano, kilometros, combustible, precio, estado, matricula];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error al actualizar vehículo:", err.sqlMessage || err.message);
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "Ya existe un vehículo con esa matrícula" });
      }
      return res.status(500).json({ error: "Error al actualizar vehículo" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    return res.json({ mensaje: "Vehículo actualizado correctamente" });
  });
};

/**
 * @function eliminarVehiculo
 * @description Elimina un vehículo de la base de datos.
 * @route DELETE /vehiculos/:matricula
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @returns {JSON} Mensaje de éxito o error
 * @throws {404} Vehículo no encontrado
 * @throws {500} Error al eliminar vehículo
 */
export const eliminarVehiculo = (req, res) => {
  const { matricula } = req.params;

  const sql = "DELETE FROM vehiculos WHERE matricula = ?";
  connection.query(sql, [matricula], (err, result) => {
    if (err) {
      console.error("Error al eliminar vehículo:", err);
      return res.status(500).json({ error: "Error al eliminar vehículo" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    return res.json({ mensaje: "Vehículo eliminado correctamente" });
  });
};