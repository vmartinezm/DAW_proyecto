import connection from "../config/db.js";

/**
 * @function obtenerVentas
 * @description Obtiene todas las ventas incluyendo información del vehículo, cliente y vendedor.
 * @route GET /ventas
 * @returns {JSON} Lista de ventas
 */
export const obtenerVentas = (req, res) => {
  const sql = `
    SELECT 
      ve.*, 
      v.matricula, v.marca,
      c.dni, c.nombre AS cliente_nombre, c.apellidos AS cliente_apellidos,
      u.nombre AS vendedor_nombre, u.apellidos AS vendedor_apellidos
    FROM ventas ve
    LEFT JOIN vehiculos v ON ve.vehiculo_id = v.matricula
    LEFT JOIN clientes c ON ve.cliente_dni = c.dni
    LEFT JOIN usuarios u ON ve.vendedor_id = u.user_id
  `;
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener ventas:", err);
      return res.status(500).json({ error: "Error al obtener ventas" });
    }
    res.status(200).json(results);
  });
};

/**
 * @function obtenerVentaPorId
 * @description Obtiene una venta específica por su ID.
 * @route GET /ventas/:venta_id
 * @param {number} venta_id ID de la venta
 * @returns {JSON} Venta encontrada o error 404
 */
export const obtenerVentaPorId = (req, res) => {
  const { venta_id } = req.params;
  const sql = `
    SELECT 
      ve.*, 
      v.matricula, v.marca,
      c.dni, c.nombre AS cliente_nombre, c.apellidos AS cliente_apellidos,
      u.nombre AS vendedor_nombre, u.apellidos AS vendedor_apellidos
    FROM ventas ve
    LEFT JOIN vehiculos v ON ve.vehiculo_id = v.matricula
    LEFT JOIN clientes c ON ve.cliente_dni = c.dni
    LEFT JOIN usuarios u ON ve.vendedor_id = u.user_id
    WHERE ve.venta_id = ?
  `;
  connection.query(sql, [venta_id], (err, results) => {
    if (err) {
      console.error("Error al obtener venta:", err);
      return res.status(500).json({ error: "Error al obtener venta" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Venta no encontrada" });
    }
    res.json(results[0]);
  });
};

/**
 * @function anadirVenta
 * @description Inserta una nueva venta y actualiza el estado del vehículo (reservado o vendido).
 * @route POST /ventas
 * @param {string} vehiculo_id Matrícula del vehículo
 * @param {string} cliente_dni DNI del cliente
 * @param {string} fecha Fecha de la venta
 * @param {number} precio_venta Precio final
 * @param {number} vendedor_id ID del usuario vendedor
 * @param {string} notas Observaciones (opcional)
 * @param {"venta"|"reserva"} tipo Tipo de transacción
 */
export const anadirVenta = (req, res) => {
  const { vehiculo_id, cliente_dni, fecha, precio_venta, vendedor_id, notas, tipo } = req.body;

  const sql = `
    INSERT INTO ventas (vehiculo_id, cliente_dni, fecha, precio_venta, vendedor_id, notas, tipo)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  connection.query(sql, [vehiculo_id, cliente_dni, fecha, precio_venta, vendedor_id, notas, tipo], (err, result) => {
    if (err) {
      console.error("Error al agregar venta:", err);
      return res.status(500).json({ error: "Error al agregar venta" });
    }

    const estadoVehiculo = tipo === 'reserva' ? 'reservado' : 'vendido';

    const updateSql = 'UPDATE vehiculos SET estado = ? WHERE matricula = ?';
    connection.query(updateSql, [estadoVehiculo, vehiculo_id], (updateErr) => {
      if (updateErr) {
        console.error("Error al actualizar estado del vehículo:", updateErr);
        return res.status(500).json({ error: "Venta creada, pero error al actualizar estado del vehículo" });
      }
      res.json({ mensaje: `Venta agregada correctamente y vehículo marcado como ${estadoVehiculo}` });
    });
  });
};


/**
 * @function actualizarVenta
 * @description Actualiza los datos de una venta existente, y si cambia el tipo, actualiza el estado del vehículo.
 * @route PUT /ventas/:venta_id
 * @param {number} venta_id ID de la venta
 */
export const actualizarVenta = (req, res) => {
  const { venta_id } = req.params;
  const { vehiculo_id, cliente_dni, fecha, precio_venta, vendedor_id, notas, tipo } = req.body;

  const sqlSelect = "SELECT tipo FROM ventas WHERE venta_id = ?";
  connection.query(sqlSelect, [venta_id], (err, results) => {
    if (err || results.length === 0) {
      console.error("Error al obtener venta:", err);
      return res.status(500).json({ error: "Venta no encontrada" });
    }

    const tipoAnterior = results[0].tipo;

    const sqlUpdate = `
      UPDATE ventas 
      SET vehiculo_id = ?, cliente_dni = ?, fecha = ?, precio_venta = ?, vendedor_id = ?, notas = ?, tipo = ?
      WHERE venta_id = ?
    `;
    connection.query(sqlUpdate, [vehiculo_id, cliente_dni, fecha, precio_venta, vendedor_id, notas, tipo, venta_id], (err2, result) => {
      if (err2) {
        console.error("Error al actualizar venta:", err2);
        return res.status(500).json({ error: "Error al actualizar venta" });
      }

      let estadoVehiculo;
      if (tipoAnterior !== tipo) {
        estadoVehiculo = tipo === 'reserva' ? 'reservado' : 'vendido';
        const updateVehiculoSql = "UPDATE vehiculos SET estado = ? WHERE matricula = ?";
        connection.query(updateVehiculoSql, [estadoVehiculo, vehiculo_id], (err3) => {
          if (err3) {
            console.error("Error al actualizar estado del vehículo:", err3);
            return res.status(500).json({ error: "Venta actualizada, pero error al actualizar estado del vehículo" });
          }
          res.json({ mensaje: `Venta actualizada correctamente y vehículo marcado como ${estadoVehiculo}` });
        });
      } else {
        res.json({ mensaje: "Venta actualizada correctamente" });
      }
    });
  });
};


/**
 * @function eliminarVenta
 * @description Elimina una venta y marca el vehículo relacionado como disponible.
 * @route DELETE /ventas/:venta_id
 * @param {number} venta_id ID de la venta
 */
export const eliminarVenta = (req, res) => {
  const { venta_id } = req.params;

  const sqlSelect = "SELECT vehiculo_id FROM ventas WHERE venta_id = ?";
  connection.query(sqlSelect, [venta_id], (err, results) => {
    if (err || results.length === 0) {
      console.error("Error al obtener venta:", err);
      return res.status(404).json({ error: "Venta no encontrada" });
    }

    const vehiculo_id = results[0].vehiculo_id;

    const sqlDelete = "DELETE FROM ventas WHERE venta_id = ?";
    connection.query(sqlDelete, [venta_id], (err2, result) => {
      if (err2) {
        console.error("Error al eliminar venta:", err2);
        return res.status(500).json({ error: "Error al eliminar venta" });
      }

      const sqlUpdateVehiculo = "UPDATE vehiculos SET estado = 'disponible' WHERE matricula = ?";
      connection.query(sqlUpdateVehiculo, [vehiculo_id], (err3) => {
        if (err3) {
          console.error("Error al actualizar estado del vehículo:", err3);
          return res.status(500).json({ error: "Venta eliminada, pero error al actualizar estado del vehículo" });
        }

        res.json({ mensaje: "Venta eliminada y vehículo marcado como disponible correctamente" });
      });
    });
  });
};