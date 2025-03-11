
-- Creazione del database
CREATE DATABASE IF NOT EXISTS cirelli_inventory;
USE cirelli_inventory;

-- Creazione della tabella vehicles
CREATE TABLE IF NOT EXISTS vehicles (
  id VARCHAR(36) PRIMARY KEY,
  model VARCHAR(100) NOT NULL,
  trim VARCHAR(100) NOT NULL,
  fuelType VARCHAR(50) NOT NULL,
  exteriorColor VARCHAR(100) NOT NULL,
  accessories TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  location VARCHAR(100) NOT NULL,
  imageUrl VARCHAR(255),
  status ENUM('available', 'reserved', 'sold') NOT NULL DEFAULT 'available',
  dateAdded DATE NOT NULL,
  transmission VARCHAR(50)
);

-- Creazione della tabella users
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  role ENUM('admin', 'dealer') NOT NULL,
  dealerName VARCHAR(100)
);

-- Creazione della tabella quotes
CREATE TABLE IF NOT EXISTS quotes (
  id VARCHAR(36) PRIMARY KEY,
  vehicleId VARCHAR(36) NOT NULL,
  dealerId VARCHAR(36) NOT NULL,
  customerName VARCHAR(100) NOT NULL,
  customerEmail VARCHAR(100) NOT NULL,
  customerPhone VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) NOT NULL,
  finalPrice DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'converted') NOT NULL DEFAULT 'pending',
  createdAt DATE NOT NULL,
  FOREIGN KEY (vehicleId) REFERENCES vehicles(id),
  FOREIGN KEY (dealerId) REFERENCES users(id)
);

-- Creazione della tabella orders
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) PRIMARY KEY,
  vehicleId VARCHAR(36) NOT NULL,
  dealerId VARCHAR(36) NOT NULL,
  quoteId VARCHAR(36),
  customerName VARCHAR(100) NOT NULL,
  status ENUM('processing', 'delivered', 'cancelled') NOT NULL DEFAULT 'processing',
  orderDate DATE NOT NULL,
  deliveryDate DATE,
  FOREIGN KEY (vehicleId) REFERENCES vehicles(id),
  FOREIGN KEY (dealerId) REFERENCES users(id),
  FOREIGN KEY (quoteId) REFERENCES quotes(id)
);

-- Inserimento di dati di esempio: vehicles
INSERT INTO vehicles (id, model, trim, fuelType, exteriorColor, accessories, price, location, imageUrl, status, dateAdded)
VALUES
('1', 'Cirelli 500', 'Sport', 'Hybrid', 'Rosso Racing', '["Navigation System", "Premium Audio", "Leather Seats"]', 28500, 'Main Warehouse', 'https://images.unsplash.com/photo-1541348263662-e068662d82af?q=80&w=2148&auto=format&fit=crop', 'available', '2023-11-15'),
('2', 'Cirelli SUV', 'Elegance', 'Diesel', 'Nero Intenso', '["Panoramic Roof", "All-wheel Drive", "Heated Seats"]', 42000, 'North Branch', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop', 'available', '2023-12-01'),
('3', 'Cirelli Berlina', 'Executive', 'Electric', 'Azzurro Marino', '["Driver Assistance Package", "Premium Interior", "Fast Charging"]', 56000, 'Main Warehouse', 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=2025&auto=format&fit=crop', 'reserved', '2024-01-05'),
('4', 'Cirelli Spyder', 'Sport+', 'Gasoline', 'Bianco Perla', '["Carbon Package", "Racing Seats", "Sport Suspension"]', 78000, 'South Branch', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop', 'available', '2024-02-10'),
('5', 'Cirelli 500', 'Base', 'Hybrid', 'Grigio Metallico', '["Basic Package", "Air Conditioning"]', 24000, 'East Branch', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070&auto=format&fit=crop', 'sold', '2023-10-20'),
('6', 'Cirelli SUV', 'Adventure', 'Diesel', 'Verde Natura', '["Off-road Package", "Roof Rails", "Tow Hook"]', 46000, 'North Branch', 'https://images.unsplash.com/photo-1567343483496-bdf93e63ab81?q=80&w=2062&auto=format&fit=crop', 'available', '2024-01-25');

-- Inserimento di dati di esempio: users
INSERT INTO users (id, name, email, role, dealerName)
VALUES
('1', 'Admin User', 'admin@cirelli.com', 'admin', NULL),
('2', 'Marco Rossi', 'marco@autogalleriarossi.it', 'dealer', 'Auto Galleria Rossi'),
('3', 'Giulia Bianchi', 'giulia@motovallebianchi.it', 'dealer', 'MotorValle Bianchi');

-- Inserimento di dati di esempio: quotes
INSERT INTO quotes (id, vehicleId, dealerId, customerName, customerEmail, customerPhone, price, discount, finalPrice, status, createdAt)
VALUES
('1', '1', '2', 'Luca Ferrari', 'luca.f@example.com', '+39 333 1234567', 28500, 1500, 27000, 'pending', '2024-02-20'),
('2', '3', '3', 'Maria Verdi', 'maria.v@example.com', '+39 333 7654321', 56000, 2000, 54000, 'approved', '2024-03-05'),
('3', '4', '2', 'Giovanni Neri', 'g.neri@example.com', '+39 333 9876543', 78000, 3000, 75000, 'converted', '2024-01-15');

-- Inserimento di dati di esempio: orders
INSERT INTO orders (id, vehicleId, dealerId, quoteId, customerName, status, orderDate, deliveryDate)
VALUES
('1', '4', '2', '3', 'Giovanni Neri', 'delivered', '2024-01-20', '2024-02-10'),
('2', '5', '3', NULL, 'Antonio Russo', 'delivered', '2023-11-10', '2023-12-01'),
('3', '2', '2', NULL, 'Elena Conti', 'processing', '2024-03-01', NULL);

