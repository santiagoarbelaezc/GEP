-- GEP Database Schema
-- TODO: Execute this migration to create all tables

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('admin','caja','tv','logistica') NOT NULL DEFAULT 'caja',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    folio VARCHAR(20) NOT NULL UNIQUE,
    cliente_nombre VARCHAR(100) NOT NULL,
    cliente_telefono VARCHAR(20),
    cliente_email VARCHAR(150),
    direccion_envio TEXT NOT NULL,
    ciudad VARCHAR(50) NOT NULL,
    referencias TEXT,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    estado ENUM('nuevo','pago_pendiente','pago_en_revision','pago_confirmado','rechazado','en_preparacion','en_camino','entregado','cancelado') NOT NULL DEFAULT 'nuevo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pedido_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT,
    variante_id INT,
    nombre_producto VARCHAR(150) NOT NULL,
    nombre_variante VARCHAR(100),
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    metodo VARCHAR(50) NOT NULL,
    referencia VARCHAR(100),
    comprobante_url VARCHAR(500),
    estado ENUM('pendiente','revisado','confirmado','rechazado') NOT NULL DEFAULT 'pendiente',
    revisado_por INT,
    fecha_revision TIMESTAMP NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (revisado_por) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS pedido_historial (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    estado_anterior VARCHAR(30) NOT NULL,
    estado_nuevo VARCHAR(30) NOT NULL,
    usuario_id INT,
    nota TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS entregas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    foto_url VARCHAR(500) NOT NULL,
    usuario_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
