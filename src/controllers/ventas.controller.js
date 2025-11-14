import connection from "../config/db.js";

// ✅ Obtener todas las ventas (con info del vehículo, cliente y vendedor)
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

// ✅ Obtener una venta por ID
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

// ✅ Agregar una nueva venta (con actualización automática del vehículo)
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

    // Determinar estado según tipo
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

// ✅ Actualizar venta
export const actualizarVenta = (req, res) => {
  const { venta_id } = req.params;
  const { vehiculo_id, cliente_dni, fecha, precio_venta, vendedor_id, notas, tipo } = req.body;

  // 1️⃣ Obtener tipo actual de la venta
  const sqlSelect = "SELECT tipo FROM ventas WHERE venta_id = ?";
  connection.query(sqlSelect, [venta_id], (err, results) => {
    if (err || results.length === 0) {
      console.error("Error al obtener venta:", err);
      return res.status(500).json({ error: "Venta no encontrada" });
    }

    const tipoAnterior = results[0].tipo;

    // 2️⃣ Actualizar datos de la venta
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

      // 3️⃣ Determinar nuevo estado del vehículo si cambió el tipo
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

// ✅ Eliminar venta (y marcar el vehículo como disponible)
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