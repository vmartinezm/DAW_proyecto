// src/controllers/vehiculos.controller.js
import connection from "../config/db.js";

// 🟢 Obtener todos los vehículos
export const obtenerVehiculos = (req, res) => {
  const sql = 'SELECT * FROM vehiculos';

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener vehículos:', err);
      return res.status(500).json({ error: 'Error al obtener vehículos' });
    }

    return res.status(200).json(results);
  });
};

// 🟢 Obtener un vehículo por matrícula
export const obtenerVehiculoPorMatricula = (req, res) => {
  const { matricula } = req.params;

  const sql = 'SELECT * FROM vehiculos WHERE matricula = ?';
  connection.query(sql, [matricula], (err, results) => {
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
    return res.status(400).json({ error: 'Faltan campos obligatorios: matricula, marca o modelo' });
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
      console.error('Error al insertar vehículo:', err.sqlMessage || err.message);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Ya existe un vehículo con esa matrícula' });
      }
      return res.status(500).json({ error: 'Error al insertar vehículo' });
    }

    return res.status(201).json({
      mensaje: 'Vehículo añadido correctamente',
      matricula: matricula,
    });
  });
};

// 🟢 Actualizar un vehículo
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
      console.error('Error al actualizar vehículo:', err.sqlMessage || err.message);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Ya existe un vehículo con esa matrícula' });
      }
      return res.status(500).json({ error: 'Error al actualizar vehículo' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    return res.json({ mensaje: 'Vehículo actualizado correctamente' });
  });
};

// 🟢 Eliminar un vehículo
export const eliminarVehiculo = (req, res) => {
  const { matricula } = req.params;

  const sql = 'DELETE FROM vehiculos WHERE matricula = ?';
  connection.query(sql, [matricula], (err, result) => {
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
