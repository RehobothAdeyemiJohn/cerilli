
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');

// Carica le variabili d'ambiente
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Configurazione database
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cirelli_inventory',
};

// Pool di connessioni
let pool;

// Inizializza il pool di connessioni
async function initializePool() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log('Database connesso con successo.');
  } catch (error) {
    console.error('Errore durante la connessione al database:', error);
    process.exit(1);
  }
}

// API per i veicoli
app.get('/api/vehicles', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vehicles');
    // Converti le stringhe JSON in array
    const vehicles = rows.map(vehicle => ({
      ...vehicle,
      accessories: JSON.parse(vehicle.accessories)
    }));
    res.json(vehicles);
  } catch (error) {
    console.error('Errore durante il recupero dei veicoli:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

app.get('/api/vehicles/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Veicolo non trovato' });
    }
    // Converti la stringa JSON in array
    const vehicle = {
      ...rows[0],
      accessories: JSON.parse(rows[0].accessories)
    };
    res.json(vehicle);
  } catch (error) {
    console.error('Errore durante il recupero del veicolo:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

app.post('/api/vehicles', async (req, res) => {
  try {
    const { model, trim, fuelType, exteriorColor, accessories, price, location, imageUrl, status, dateAdded, transmission } = req.body;
    const id = uuidv4();
    
    // Converti l'array in stringa JSON
    const accessoriesJSON = JSON.stringify(accessories);
    
    await pool.query(
      'INSERT INTO vehicles (id, model, trim, fuelType, exteriorColor, accessories, price, location, imageUrl, status, dateAdded, transmission) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, model, trim, fuelType, exteriorColor, accessoriesJSON, price, location, imageUrl, status, dateAdded, transmission]
    );
    
    const [rows] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [id]);
    // Converti la stringa JSON in array
    const vehicle = {
      ...rows[0],
      accessories: JSON.parse(rows[0].accessories)
    };
    
    res.status(201).json(vehicle);
  } catch (error) {
    console.error('Errore durante la creazione del veicolo:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

app.put('/api/vehicles/:id', async (req, res) => {
  try {
    const { model, trim, fuelType, exteriorColor, accessories, price, location, imageUrl, status, dateAdded, transmission } = req.body;
    const { id } = req.params;
    
    // Prima controlla se il veicolo esiste
    const [existingVehicle] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [id]);
    if (existingVehicle.length === 0) {
      return res.status(404).json({ error: 'Veicolo non trovato' });
    }
    
    // Prepara gli aggiornamenti
    const updates = {};
    if (model !== undefined) updates.model = model;
    if (trim !== undefined) updates.trim = trim;
    if (fuelType !== undefined) updates.fuelType = fuelType;
    if (exteriorColor !== undefined) updates.exteriorColor = exteriorColor;
    if (accessories !== undefined) updates.accessories = JSON.stringify(accessories);
    if (price !== undefined) updates.price = price;
    if (location !== undefined) updates.location = location;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (status !== undefined) updates.status = status;
    if (dateAdded !== undefined) updates.dateAdded = dateAdded;
    if (transmission !== undefined) updates.transmission = transmission;
    
    // Crea la query dinamica
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Nessun campo da aggiornare' });
    }
    
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];
    
    await pool.query(`UPDATE vehicles SET ${setClause} WHERE id = ?`, values);
    
    const [updatedRows] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [id]);
    // Converti la stringa JSON in array
    const vehicle = {
      ...updatedRows[0],
      accessories: JSON.parse(updatedRows[0].accessories)
    };
    
    res.json(vehicle);
  } catch (error) {
    console.error('Errore durante l\'aggiornamento del veicolo:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prima controlla se il veicolo esiste
    const [existingVehicle] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [id]);
    if (existingVehicle.length === 0) {
      return res.status(404).json({ error: 'Veicolo non trovato' });
    }
    
    // Verifica se ci sono quote o ordini associati
    const [relatedQuotes] = await pool.query('SELECT * FROM quotes WHERE vehicleId = ?', [id]);
    const [relatedOrders] = await pool.query('SELECT * FROM orders WHERE vehicleId = ?', [id]);
    
    if (relatedQuotes.length > 0 || relatedOrders.length > 0) {
      // In un'applicazione reale, potresti voler implementare una cancellazione a cascata
      // o un soft delete invece di restituire un errore
      return res.status(400).json({ 
        error: 'Impossibile eliminare il veicolo perché ha preventivi o ordini associati' 
      });
    }
    
    await pool.query('DELETE FROM vehicles WHERE id = ?', [id]);
    
    res.status(204).send();
  } catch (error) {
    console.error('Errore durante l\'eliminazione del veicolo:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Implementazione delle API per quotes, orders e users seguirebbe uno schema simile

// Avvio del server
const PORT = process.env.PORT || 3001;

async function startServer() {
  await initializePool();
  
  app.listen(PORT, () => {
    console.log(`Server in esecuzione sulla porta ${PORT}`);
  });
}

startServer();
