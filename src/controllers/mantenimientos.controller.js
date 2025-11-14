import connection from "../config/db.js";


// ======================================================
//  Obtener todos los mantenimientos
// ======================================================
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


// ======================================================
//  Obtener un mantenimiento por ID
// ======================================================
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



// ======================================================
//  FUNCIÓN: determina el estado del vehículo según fecha_fin
// ======================================================
function determinarEstadoVehiculo(fecha_fin) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (!fecha_fin) return "mantenimiento";

  const f = new Date(fecha_fin);
  f.setHours(0, 0, 0, 0);

  return f < hoy ? "disponible" : "mantenimiento";
}



// ======================================================
//  Añadir mantenimiento
// ======================================================
export const anadirMantenimiento = (req, res) => {
  const { vehiculo_id, fecha_inicio, fecha_fin, descripcion, coste, realizado_por } = req.body;

  if (!vehiculo_id || !fecha_inicio) {
    return res.status(400).json({ error: "Vehículo y fecha de inicio son obligatorios" });
  }

  const sqlInsert = `
    INSERT INTO mantenimientos
    (vehiculo_id, fecha_inicio, fecha_fin, descripcion, coste, realizado_por)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    sqlInsert,
    [vehiculo_id, fecha_inicio, fecha_fin || null, descripcion, coste, realizado_por],
    (err, result) => {
      if (err) {
        console.error("Error al agregar mantenimiento:", err);
        return res.status(500).json({ error: "Error al agregar mantenimiento" });
      }

      // Igual que ventas → actualización inmediata del estado
      const nuevoEstado = determinarEstadoVehiculo(fecha_fin);

      const sqlUpdateVehiculo = `
        UPDATE vehiculos SET estado = ? WHERE matricula = ?
      `;
      connection.query(sqlUpdateVehiculo, [nuevoEstado, vehiculo_id], (err2) => {
        if (err2) {
          console.error("Error al actualizar estado del vehículo:", err2);
          return res.status(500).json({
            error: "Mantenimiento creado, pero error al actualizar estado del vehículo"
          });
        }

        res.json({
          mensaje: `Mantenimiento añadido correctamente y vehículo marcado como ${nuevoEstado}`
        });
      });
    }
  );
};



// ======================================================
//  Actualizar mantenimiento
// ======================================================
export const actualizarMantenimiento = (req, res) => {
  const { mantenimiento_id } = req.params;
  const { vehiculo_id, fecha_inicio, fecha_fin, descripcion, coste, realizado_por } = req.body;

  const sqlUpdate = `
    UPDATE mantenimientos
    SET vehiculo_id = ?, fecha_inicio = ?, fecha_fin = ?, descripcion = ?, coste = ?, realizado_por = ?
    WHERE mantenimiento_id = ?
  `;

  connection.query(
    sqlUpdate,
    [vehiculo_id, fecha_inicio, fecha_fin || null, descripcion, coste, realizado_por, mantenimiento_id],
    (err, result) => {
      if (err) {
        console.error("Error al actualizar mantenimiento:", err);
        return res.status(500).json({ error: "Error al actualizar mantenimiento" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Mantenimiento no encontrado" });
      }

      // Igual que ventas → actualizar estado inmediato
      const nuevoEstado = determinarEstadoVehiculo(fecha_fin);

      const sqlVehiculo = `UPDATE vehiculos SET estado = ? WHERE matricula = ?`;

      connection.query(sqlVehiculo, [nuevoEstado, vehiculo_id], (err2) => {
        if (err2) {
          console.error("Error al actualizar estado del vehículo:", err2);
          return res.status(500).json({
            error: "Mantenimiento actualizado pero error al actualizar estado del vehículo"
          });
        }

        res.json({
          mensaje: `Mantenimiento actualizado correctamente y vehículo marcado como ${nuevoEstado}`
        });
      });
    }
  );
};



// ======================================================
//  Eliminar mantenimiento
// ======================================================
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
        return res.status(500).json({ error: "Error al eliminar mantenimiento" });
      }

      // Al eliminar un mantenimiento → el vehículo vuelve a disponible
      const sqlUpdateVehiculo = `
        UPDATE vehiculos SET estado = 'disponible' WHERE matricula = ?
      `;
      connection.query(sqlUpdateVehiculo, [vehiculo_id], (err3) => {
        if (err3) {
          console.error("Error al actualizar estado del vehículo:", err3);
          return res.status(500).json({
            error: "Mantenimiento eliminado pero error al actualizar estado del vehículo"
          });
        }

        res.json({
          mensaje: "Mantenimiento eliminado y vehículo marcado como disponible"
        });
      });
    });
  });
};
