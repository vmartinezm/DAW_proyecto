import connection from "../config/db.js";

// Obtener todos los vehículos
export const getVehiculos = (req, res) => {
  const sql = 'SELECT * FROM vehiculos';
  
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener vehículos:', err);
      res.status(500).json({ error: 'Error al obtener vehículos' });
      return;
    }

    // Esto debe ser un array puro
    res.status(200).json(results);
  });
};


// Agregar un nuevo vehículo
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
    return res.status(400).json({ error: "Faltan campos obligatorios" });
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
      console.error("Error al insertar vehículo:", err);
      res.status(500).json({ error: "Error al insertar vehículo" });
      return;
    }

    res
      .status(201)
      .json({ mensaje: "Vehículo añadido correctamente", id: result.insertId });
  });
};
