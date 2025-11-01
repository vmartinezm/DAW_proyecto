// src/controllers/vehiculos.controller.js
import connection from "../config/db.js";

// 🟢 Obtener todos los vehículos
export const getVehiculos = (req, res) => {
  const sql = 'SELECT * FROM vehiculos';

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener vehículos:', err);
      return res.status(500).json({ error: 'Error al obtener vehículos' });
    }

    // Enviamos los resultados como array puro
    return res.status(200).json(results);
  });
};

// 🟢 Obtener un vehículo por ID
export const getVehiculoById = (req, res) => {
  const { id } = req.params;

  // Validar ID numérico
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const sql = 'SELECT * FROM vehiculos WHERE id = ?';
  connection.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error al obtener vehículo:', err);
      return res.status(500).json({ error: 'Error al obtener vehículo' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    return res.json(results[0]);
  });
};

// 🟢 Agregar un nuevo vehículo
export const addVehiculo = (req, res) => {
  const {
    marca,
    modelo,
    version,
    matricula,
    color,
    ano,
    kilometros,
    combustible,
    precio,
    estado,
  } = req.body;

  if (!marca || !modelo || !matricula) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const sql = `
    INSERT INTO vehiculos (marca, modelo, version, matricula, color, ano, kilometros, combustible, precio, estado)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    marca,
    modelo,
    version,
    matricula,
    color,
    ano,
    kilometros,
    combustible,
    precio,
    estado,
  ];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error al insertar vehículo:', err.sqlMessage || err.message);
      return res.status(500).json({ error: 'Error al insertar vehículo' });
    }

    return res
      .status(201)
      .json({ mensaje: 'Vehículo añadido correctamente', id: result.insertId });
  });
};

// 🟢 Actualizar un vehículo
export const updateVehiculo = (req, res) => {
  const { id } = req.params;
  const { marca, modelo, version, matricula, color, ano, kilometros, combustible, precio, estado } = req.body;

  const sql = `
    UPDATE vehiculos
    SET marca = ?, modelo = ?, version = ?, matricula = ?, color = ?, ano = ?, kilometros = ?, combustible = ?, precio = ?, estado = ?
    WHERE id = ?
  `;
  const values = [marca, modelo, version, matricula, color, ano, kilometros, combustible, precio, estado, id];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error al actualizar vehículo:', err.sqlMessage || err.message);

      // Añadimos manejo más claro
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Ya existe un vehículo con esa matrícula' });
      }

      res.status(500).json({ error: 'Error al actualizar vehículo' });
      return;
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    res.json({ mensaje: 'Vehículo actualizado correctamente' });
  });
};


// 🟢 Eliminar un vehículo
export const deleteVehiculo = (req, res) => {
  const { id } = req.params;

  // Validar ID numérico
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const sql = 'DELETE FROM vehiculos WHERE id = ?';
  connection.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar vehículo:', err);
      return res.status(500).json({ error: 'Error al eliminar vehículo' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    return res.json({ mensaje: 'Vehículo eliminado correctamente' });
  });
};
