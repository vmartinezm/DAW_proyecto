/** 
 * @file clientes.controller.js
 * @description Controlador para gestionar las operaciones CRUD de clientes.
 * @module controllers/clientes
 */

// Importar la conexión a la base de datos
import connection from "../config/db.js";

/**
 * @function obtenerClientes
 * @description Obtiene todos los clientes registrados.
 * @route GET /clientes
 * @returns {JSON} Lista de clientes
 * @throws {500} Error al obtener clientes
 */
export const obtenerClientes = (req, res) => {
  const sql = "SELECT * FROM clientes";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener clientes:", err);
      return res.status(500).json({ error: "Error al obtener clientes" });
    }
    res.status(200).json(results);
  });
};

/**
 * @function obtenerClientePorDni
 * @description Obtiene un cliente según su DNI.
 * @route GET /clientes/:dni
 * @param {string} dni DNI del cliente
 * @returns {JSON} Datos del cliente o error 404
 * @throws {500} Error al obtener cliente
 */
export const obtenerClientePorDni = (req, res) => {
  const { dni } = req.params;
  const sql = "SELECT * FROM clientes WHERE dni = ?";
  connection.query(sql, [dni], (err, results) => {
    if (err) {
      console.error("Error al obtener cliente:", err);
      return res.status(500).json({ error: "Error al obtener cliente" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.json(results[0]);
  });
};

/**
 * @function anadirCliente
 * @description Inserta un nuevo cliente en la base de datos. Valida que el DNI y email no estén duplicados.
 * @route POST /clientes
 * @param {string} dni DNI único del cliente
 * @param {string} nombre
 * @param {string} apellidos
 * @param {string} email (único)
 * @param {string} telefono
 * @param {string} direccion
 * @returns {JSON} Mensaje de éxito o error
 * @throws {400} DNI o email duplicado
 * @throws {500} Error al añadir cliente
 */
export const anadirCliente = (req, res) => {
  const { dni, nombre, apellidos, email, telefono, direccion } = req.body;
  const sql =
    "INSERT INTO clientes (dni, nombre, apellidos, email, telefono, direccion) VALUES (?, ?, ?, ?, ?, ?)";

  connection.query(
    sql,
    [dni, nombre, apellidos, email, telefono, direccion],
    (err, result) => {
      if (err) {
        console.error("Error al añadir cliente:", err);

        /** Detección de clave duplicada en MySQL (dni/email) */
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({
            error: "El DNI o el email ya están registrados",
          });
        }

        return res.status(500).json({ error: "Error al añadir cliente" });
      }

      res.json({ mensaje: "Cliente añadido correctamente" });
    }
  );
};

/**
 * @function actualizarCliente
 * @description Actualiza los datos de un cliente existente.
 * @route PUT /clientes/:dni
 * @param {string} dni DNI del cliente a modificar
 * @param {string} nombre
 * @param {string} apellidos
 * @param {string} email
 * @param {string} telefono
 * @param {string} direccion
 * @returns {JSON} Mensaje de éxito o error
 * @throws {400} Email duplicado
 * @throws {404} Cliente no encontrado
 * @throws {500} Error al actualizar cliente
 */
export const actualizarCliente = (req, res) => {
  const { dni } = req.params;
  const { nombre, apellidos, email, telefono, direccion } = req.body;
  const sql =
    "UPDATE clientes SET nombre = ?, apellidos = ?, email = ?, telefono = ?, direccion = ? WHERE dni = ?";
  connection.query(
    sql,
    [nombre, apellidos, email, telefono, direccion, dni],
    (err, result) => {
      if (err) {
        console.error("Error al actualizar cliente:", err);

        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({
            error: "El email ya está registrado por otro cliente",
          });
        }

        return res.status(500).json({ error: "Error al actualizar cliente" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Cliente no encontrado" });
      }
      res.json({ mensaje: "Cliente actualizado correctamente" });
    }
  );
};

/**
 * @function eliminarCliente
 * @description Elimina un cliente existente.
 * @route DELETE /clientes/:dni
 * @param {string} dni DNI del cliente a eliminar
 * @returns {JSON} Mensaje de éxito o error
 * @throws {404} Cliente no encontrado
 * @throws {500} Error al eliminar cliente
 */
export const eliminarCliente = (req, res) => {
  const { dni } = req.params;
  const sql = "DELETE FROM clientes WHERE dni = ?";
  connection.query(sql, [dni], (err, result) => {
    if (err) {
      console.error("Error al eliminar cliente:", err);
      return res.status(500).json({ error: "Error al eliminar cliente" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.json({ mensaje: "Cliente eliminado correctamente" });
  });
};