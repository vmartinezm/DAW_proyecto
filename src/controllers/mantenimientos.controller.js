/**
 * @file src/controllers/mantenimientos.controller.js
 * @description Controlador para gestionar los mantenimientos de vehículos.
 * @module controllers/mantenimientos.controller
 */

// Importar la conexión a la base de datos
import connection from "../config/db.js";

/**
 * @function obtenerMantenimientos
 * @description Obtiene todos los mantenimientos con los datos del vehículo y del empleado relacionados.
 * @route GET /mantenimientos
 * @returns {JSON} Lista de mantenimientos
 * @throws {500} Error al obtener mantenimientos
 */
export const obtenerMantenimientos = (req, res) => {
  const sql = `
    SELECT 
      m.*, 
      v.matricula, v.marca, v.modelo,
      u.nombre AS empleado_nombre, u.apellidos AS empleado_apellidos
    FROM mantenimientos m
    LEFT JOIN vehiculos v ON m.vehiculo_id = v.matricula
    LEFT JOIN usuarios u ON m.realizado_por = u.user_id
    ORDER BY m.fecha_inicio DESC
  `;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener mantenimientos:", err);
      return res.status(500).json({ error: "Error al obtener mantenimientos" });
    }
    res.status(200).json(results);
  });
};

/**
 * @function obtenerMantenimientoPorId
 * @description Obtiene un mantenimiento concreto según su ID.
 * @route GET /mantenimientos/:mantenimiento_id
 * @returns {JSON} Mantenimiento encontrado o error 404
 * @throws {500} Error al obtener mantenimiento
 * @throws {404} Mantenimiento no encontrado
 */
export const obtenerMantenimientoPorId = (req, res) => {
  const { mantenimiento_id } = req.params;

  const sql = `
    SELECT 
      m.*, 
      v.matricula, v.marca, v.modelo,
      u.nombre AS empleado_nombre, u.apellidos AS empleado_apellidos
    FROM mantenimientos m
    LEFT JOIN vehiculos v ON m.vehiculo_id = v.matricula
    LEFT JOIN usuarios u ON m.realizado_por = u.user_id
    WHERE m.mantenimiento_id = ?
  `;

  connection.query(sql, [mantenimiento_id], (err, results) => {
    if (err) {
      console.error("Error al obtener mantenimiento:", err);
      return res.status(500).json({ error: "Error al obtener mantenimiento" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Mantenimiento no encontrado" });
    }

    res.status(200).json(results[0]);
  });
};

/**
 * @function determinarEstadoVehiculo
 * @private
 * @description Determina el estado correcto del vehículo según la fecha de finalización.
 * @param {string|null} fecha_fin Fecha final del mantenimiento
 * @returns {"disponible" | "mantenimiento"}
 */
function determinarEstadoVehiculo(fecha_fin) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (!fecha_fin) return "mantenimiento";

  const f = new Date(fecha_fin);
  f.setHours(0, 0, 0, 0);

  return f < hoy ? "disponible" : "mantenimiento";
}

/**
 * @function anadirMantenimiento
 * @description Agrega un mantenimiento a un vehículo y actualiza inmediatamente su estado.
 * @route POST /mantenimientos
 * @returns {JSON} Mantenimiento creado
 * @throws {500} Error al agregar mantenimiento
 */
export const anadirMantenimiento = (req, res) => {
  const {
    vehiculo_id,
    fecha_inicio,
    fecha_fin,
    descripcion,
    coste,
    realizado_por,
  } = req.body;

  if (!vehiculo_id || !fecha_inicio) {
    return res
      .status(400)
      .json({ error: "Vehículo y fecha de inicio son obligatorios" });
  }

  const sqlInsert = `
    INSERT INTO mantenimientos
    (vehiculo_id, fecha_inicio, fecha_fin, descripcion, coste, realizado_por)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    sqlInsert,
    [
      vehiculo_id,
      fecha_inicio,
      fecha_fin || null,
      descripcion,
      coste,
      realizado_por,
    ],
    (err, result) => {
      if (err) {
        console.error("Error al agregar mantenimiento:", err);
        return res
          .status(500)
          .json({ error: "Error al agregar mantenimiento" });
      }

      const nuevoEstado = determinarEstadoVehiculo(fecha_fin);

      const sqlUpdateVehiculo = `
        UPDATE vehiculos SET estado = ? WHERE matricula = ?
      `;
      connection.query(
        sqlUpdateVehiculo,
        [nuevoEstado, vehiculo_id],
        (err2) => {
          if (err2) {
            console.error("Error al actualizar estado del vehículo:", err2);
            return res.status(500).json({
              error:
                "Mantenimiento creado, pero error al actualizar estado del vehículo",
            });
          }

          res.json({
            mensaje: `Mantenimiento añadido correctamente y vehículo marcado como ${nuevoEstado}`,
          });
        }
      );
    }
  );
};

/**
 * @function actualizarMantenimiento
 * @description Actualiza un mantenimiento existente y actualiza el estado del vehículo asociado.
 * @route PUT /mantenimientos/:mantenimiento_id
 * @returns {JSON} Mantenimiento actualizado
 * @throws {500} Error al actualizar mantenimiento
 * @throws {404} Mantenimiento no encontrado
 */
export const actualizarMantenimiento = (req, res) => {
  const { mantenimiento_id } = req.params;
  const {
    vehiculo_id,
    fecha_inicio,
    fecha_fin,
    descripcion,
    coste,
    realizado_por,
  } = req.body;

  const sqlUpdate = `
    UPDATE mantenimientos
    SET vehiculo_id = ?, fecha_inicio = ?, fecha_fin = ?, descripcion = ?, coste = ?, realizado_por = ?
    WHERE mantenimiento_id = ?
  `;

  connection.query(
    sqlUpdate,
    [
      vehiculo_id,
      fecha_inicio,
      fecha_fin || null,
      descripcion,
      coste,
      realizado_por,
      mantenimiento_id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error al actualizar mantenimiento:", err);
        return res
          .status(500)
          .json({ error: "Error al actualizar mantenimiento" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Mantenimiento no encontrado" });
      }

      const nuevoEstado = determinarEstadoVehiculo(fecha_fin);

      const sqlVehiculo = `UPDATE vehiculos SET estado = ? WHERE matricula = ?`;

      connection.query(sqlVehiculo, [nuevoEstado, vehiculo_id], (err2) => {
        if (err2) {
          console.error("Error al actualizar estado del vehículo:", err2);
          return res.status(500).json({
            error:
              "Mantenimiento actualizado pero error al actualizar estado del vehículo",
          });
        }

        res.json({
          mensaje: `Mantenimiento actualizado correctamente y vehículo marcado como ${nuevoEstado}`,
        });
      });
    }
  );
};

/**
 * @function eliminarMantenimiento
 * @description Elimina un mantenimiento y marca el vehículo como disponible.
 * @route DELETE /mantenimientos/:mantenimiento_id
 * @returns {JSON} Mantenimiento eliminado
 * @throws {500} Error al eliminar mantenimiento
 * @throws {404} Mantenimiento no encontrado
 */
export const eliminarMantenimiento = (req, res) => {
  const { mantenimiento_id } = req.params;

  const sqlSelect = `SELECT vehiculo_id FROM mantenimientos WHERE mantenimiento_id = ?`;

  connection.query(sqlSelect, [mantenimiento_id], (err, results) => {
    if (err || results.length === 0) {
      console.error("Error al obtener mantenimiento:", err);
      return res.status(404).json({ error: "Mantenimiento no encontrado" });
    }

    const vehiculo_id = results[0].vehiculo_id;

    const sqlDelete = `DELETE FROM mantenimientos WHERE mantenimiento_id = ?`;
    connection.query(sqlDelete, [mantenimiento_id], (err2) => {
      if (err2) {
        console.error("Error al eliminar mantenimiento:", err2);
        return res
          .status(500)
          .json({ error: "Error al eliminar mantenimiento" });
      }

      const sqlUpdateVehiculo = `
        UPDATE vehiculos SET estado = 'disponible' WHERE matricula = ?
      `;
      connection.query(sqlUpdateVehiculo, [vehiculo_id], (err3) => {
        if (err3) {
          console.error("Error al actualizar estado del vehículo:", err3);
          return res.status(500).json({
            error:
              "Mantenimiento eliminado pero error al actualizar estado del vehículo",
          });
        }

        res.json({
          mensaje: "Mantenimiento eliminado y vehículo marcado como disponible",
        });
      });
    });
  });
};
