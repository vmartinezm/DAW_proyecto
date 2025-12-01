CREATE DATABASE IF NOT EXISTS concesionario CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE concesionario;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('admin','empleado') NOT NULL DEFAULT 'empleado',
  email VARCHAR(150) UNIQUE,
  creado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (rol),
  INDEX (nombre),
  INDEX (apellidos)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla de vehículos
CREATE TABLE IF NOT EXISTS vehiculos (
  matricula VARCHAR(7) PRIMARY KEY,
  marca VARCHAR(50) NOT NULL,
  modelo VARCHAR(50) NOT NULL,
  version VARCHAR(50),
  color VARCHAR(30),
  ano SMALLINT,
  kilometros INT DEFAULT 0,
  combustible ENUM('gasolina','diesel','hibrido','electrico','otro') DEFAULT 'gasolina',
  precio DECIMAL(12,2) DEFAULT 0.00,
  estado ENUM('disponible','reservado','vendido','mantenimiento') DEFAULT 'disponible',
  observaciones TEXT,
  creado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (marca),
  INDEX (modelo),
  INDEX (estado),
  INDEX (ano)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla de clientes (dni como PRIMARY KEY)
CREATE TABLE IF NOT EXISTS clientes (
  dni VARCHAR(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  apellidos VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE,
  telefono VARCHAR(30),
  direccion VARCHAR(255),
  creado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (nombre),
  INDEX (apellidos)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla de mantenimientos
CREATE TABLE IF NOT EXISTS mantenimientos (
  mantenimiento_id INT AUTO_INCREMENT PRIMARY KEY,
  vehiculo_id VARCHAR(7) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE DEFAULT NULL,  
  descripcion TEXT,
  coste DECIMAL(10,2) DEFAULT 0.00,
  realizado_por VARCHAR(100),
  creado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(matricula) ON DELETE CASCADE,
  FOREIGN KEY (realizado_por) REFERENCES usuarios(user_id) ON DELETE SET NULL,
  INDEX (vehiculo_id),
  INDEX (fecha_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
  venta_id INT AUTO_INCREMENT PRIMARY KEY,
  vehiculo_id VARCHAR(7) NOT NULL,
  cliente_dni VARCHAR(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  fecha DATE NOT NULL,
  tipo ENUM('venta','reserva') NOT NULL DEFAULT 'venta',
  precio_venta DECIMAL(12,2) NOT NULL,
  vendedor_id INT,
  notas TEXT,
  creado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(matricula) ON DELETE RESTRICT,
  FOREIGN KEY (cliente_dni) REFERENCES clientes(dni) ON DELETE RESTRICT,
  FOREIGN KEY (vendedor_id) REFERENCES usuarios(user_id) ON DELETE SET NULL,
  INDEX (fecha),
  INDEX (precio_venta)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;