import { Vehicle, Quote, Order } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Chiavi per localStorage
const KEYS = {
  VEHICLES: 'cirelli_vehicles',
  QUOTES: 'cirelli_quotes',
  ORDERS: 'cirelli_orders',
};

// Funzione per inizializzare il database locale con dati di esempio
const initLocalStorage = () => {
  // Verifica se i dati esistono già
  if (!localStorage.getItem(KEYS.VEHICLES)) {
    // Dati di esempio per i veicoli
    const sampleVehicles: Vehicle[] = [
      {
        id: '1',
        model: 'Cirelli 500',
        trim: 'Sport',
        fuelType: 'Hybrid',
        exteriorColor: 'Rosso Racing',
        accessories: ['Navigation System', 'Premium Audio', 'Leather Seats'],
        price: 28500,
        location: 'Main Warehouse',
        imageUrl: 'https://images.unsplash.com/photo-1541348263662-e068662d82af?q=80&w=2148&auto=format&fit=crop',
        status: 'available',
        dateAdded: '2023-11-15',
        telaio: 'WBA12345678901234',
      },
      {
        id: '2',
        model: 'Cirelli SUV',
        trim: 'Elegance',
        fuelType: 'Diesel',
        exteriorColor: 'Nero Intenso',
        accessories: ['Panoramic Roof', 'All-wheel Drive', 'Heated Seats'],
        price: 42000,
        location: 'North Branch',
        imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop',
        status: 'available',
        dateAdded: '2023-12-01',
        telaio: 'WBA98765432109876',
      },
      {
        id: '3',
        model: 'Cirelli Berlina',
        trim: 'Executive',
        fuelType: 'Electric',
        exteriorColor: 'Azzurro Marino',
        accessories: ['Driver Assistance Package', 'Premium Interior', 'Fast Charging'],
        price: 56000,
        location: 'Main Warehouse',
        imageUrl: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=2025&auto=format&fit=crop',
        status: 'reserved',
        dateAdded: '2024-01-05',
        telaio: 'WBA23456789012345',
      },
      {
        id: '4',
        model: 'Cirelli Spyder',
        trim: 'Sport+',
        fuelType: 'Gasoline',
        exteriorColor: 'Bianco Perla',
        accessories: ['Carbon Package', 'Racing Seats', 'Sport Suspension'],
        price: 78000,
        location: 'South Branch',
        imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop',
        status: 'available',
        dateAdded: '2024-02-10',
        telaio: 'WBA34567890123456',
      },
      {
        id: '5',
        model: 'Cirelli 500',
        trim: 'Base',
        fuelType: 'Hybrid',
        exteriorColor: 'Grigio Metallico',
        accessories: ['Basic Package', 'Air Conditioning'],
        price: 24000,
        location: 'East Branch',
        imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070&auto=format&fit=crop',
        status: 'sold',
        dateAdded: '2023-10-20',
        telaio: 'WBA45678901234567',
      },
      {
        id: '6',
        model: 'Cirelli SUV',
        trim: 'Adventure',
        fuelType: 'Diesel',
        exteriorColor: 'Verde Natura',
        accessories: ['Off-road Package', 'Roof Rails', 'Tow Hook'],
        price: 46000,
        location: 'North Branch',
        imageUrl: 'https://images.unsplash.com/photo-1567343483496-bdf93e63ab81?q=80&w=2062&auto=format&fit=crop',
        status: 'available',
        dateAdded: '2024-01-25',
        telaio: 'WBA56789012345678',
      }
    ];
    
    localStorage.setItem(KEYS.VEHICLES, JSON.stringify(sampleVehicles));
  }

  if (!localStorage.getItem(KEYS.QUOTES)) {
    // Dati di esempio per i preventivi
    const sampleQuotes: Quote[] = [
      {
        id: '1',
        vehicleId: '1',
        dealerId: '2',
        customerName: 'Luca Ferrari',
        customerEmail: 'luca.f@example.com',
        customerPhone: '+39 333 1234567',
        price: 28500,
        discount: 1500,
        finalPrice: 27000,
        status: 'pending',
        createdAt: '2024-02-20',
      },
      {
        id: '2',
        vehicleId: '3',
        dealerId: '3',
        customerName: 'Maria Verdi',
        customerEmail: 'maria.v@example.com',
        customerPhone: '+39 333 7654321',
        price: 56000,
        discount: 2000,
        finalPrice: 54000,
        status: 'approved',
        createdAt: '2024-03-05',
      },
      {
        id: '3',
        vehicleId: '4',
        dealerId: '2',
        customerName: 'Giovanni Neri',
        customerEmail: 'g.neri@example.com',
        customerPhone: '+39 333 9876543',
        price: 78000,
        discount: 3000,
        finalPrice: 75000,
        status: 'converted',
        createdAt: '2024-01-15',
      }
    ];
    
    localStorage.setItem(KEYS.QUOTES, JSON.stringify(sampleQuotes));
  }
  
  if (!localStorage.getItem(KEYS.ORDERS)) {
    // Dati di esempio per gli ordini
    const sampleOrders: Order[] = [
      {
        id: '1',
        vehicleId: '4',
        dealerId: '2',
        quoteId: '3',
        customerName: 'Giovanni Neri',
        status: 'delivered',
        orderDate: '2024-01-20',
        deliveryDate: '2024-02-10',
      },
      {
        id: '2',
        vehicleId: '5',
        dealerId: '3',
        quoteId: null,
        customerName: 'Antonio Russo',
        status: 'delivered',
        orderDate: '2023-11-10',
        deliveryDate: '2023-12-01',
      },
      {
        id: '3',
        vehicleId: '2',
        dealerId: '2',
        quoteId: null,
        customerName: 'Elena Conti',
        status: 'processing',
        orderDate: '2024-03-01',
        deliveryDate: null,
      }
    ];
    
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(sampleOrders));
  }
};

// API per i veicoli
export const vehiclesApi = {
  getAll: async (): Promise<Vehicle[]> => {
    initLocalStorage();
    const data = localStorage.getItem(KEYS.VEHICLES);
    return data ? JSON.parse(data) : [];
  },
  
  getById: async (id: string): Promise<Vehicle> => {
    const vehicles = await vehiclesApi.getAll();
    const vehicle = vehicles.find(v => v.id === id);
    if (!vehicle) {
      throw new Error('Veicolo non trovato');
    }
    return vehicle;
  },
  
  create: async (vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
    const vehicles = await vehiclesApi.getAll();
    const newVehicle = {
      ...vehicle,
      id: uuidv4(),
      // Assicuriamoci che tutti i campi obbligatori siano presenti
      imageUrl: vehicle.imageUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop',
      dateAdded: vehicle.dateAdded || new Date().toISOString().split('T')[0],
    };
    
    vehicles.push(newVehicle);
    localStorage.setItem('cirelli_vehicles', JSON.stringify(vehicles));
    
    return newVehicle;
  },
  
  update: async (id: string, updates: Partial<Vehicle>): Promise<Vehicle> => {
    const vehicles = await vehiclesApi.getAll();
    const index = vehicles.findIndex(v => v.id === id);
    
    if (index === -1) {
      throw new Error('Veicolo non trovato');
    }
    
    const updatedVehicle = {
      ...vehicles[index],
      ...updates,
    };
    
    vehicles[index] = updatedVehicle;
    localStorage.setItem(KEYS.VEHICLES, JSON.stringify(vehicles));
    
    return updatedVehicle;
  },
  
  delete: async (id: string): Promise<void> => {
    const vehicles = await vehiclesApi.getAll();
    const filteredVehicles = vehicles.filter(v => v.id !== id);
    
    if (filteredVehicles.length === vehicles.length) {
      throw new Error('Veicolo non trovato');
    }
    
    localStorage.setItem(KEYS.VEHICLES, JSON.stringify(filteredVehicles));
  }
};

// API per preventivi (quotes)
export const quotesApi = {
  getAll: async (): Promise<Quote[]> => {
    initLocalStorage();
    const data = localStorage.getItem(KEYS.QUOTES);
    return data ? JSON.parse(data) : [];
  },
  
  getById: async (id: string): Promise<Quote> => {
    const quotes = await quotesApi.getAll();
    const quote = quotes.find(q => q.id === id);
    if (!quote) {
      throw new Error('Preventivo non trovato');
    }
    return quote;
  },
  
  create: async (quote: Omit<Quote, 'id'>): Promise<Quote> => {
    const quotes = await quotesApi.getAll();
    const newQuote = {
      ...quote,
      id: uuidv4(),
    };
    
    quotes.push(newQuote);
    localStorage.setItem(KEYS.QUOTES, JSON.stringify(quotes));
    
    return newQuote;
  },
  
  update: async (id: string, updates: Partial<Quote>): Promise<Quote> => {
    const quotes = await quotesApi.getAll();
    const index = quotes.findIndex(q => q.id === id);
    
    if (index === -1) {
      throw new Error('Preventivo non trovato');
    }
    
    const updatedQuote = {
      ...quotes[index],
      ...updates,
    };
    
    quotes[index] = updatedQuote;
    localStorage.setItem(KEYS.QUOTES, JSON.stringify(quotes));
    
    return updatedQuote;
  },
  
  delete: async (id: string): Promise<void> => {
    const quotes = await quotesApi.getAll();
    const filteredQuotes = quotes.filter(q => q.id !== id);
    
    if (filteredQuotes.length === quotes.length) {
      throw new Error('Preventivo non trovato');
    }
    
    localStorage.setItem(KEYS.QUOTES, JSON.stringify(filteredQuotes));
  }
};

// API per ordini (orders)
export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    initLocalStorage();
    const data = localStorage.getItem(KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  },
  
  getById: async (id: string): Promise<Order> => {
    const orders = await ordersApi.getAll();
    const order = orders.find(o => o.id === id);
    if (!order) {
      throw new Error('Ordine non trovato');
    }
    return order;
  },
  
  create: async (order: Omit<Order, 'id'>): Promise<Order> => {
    const orders = await ordersApi.getAll();
    const newOrder = {
      ...order,
      id: uuidv4(),
    };
    
    orders.push(newOrder);
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    
    return newOrder;
  },
  
  update: async (id: string, updates: Partial<Order>): Promise<Order> => {
    const orders = await ordersApi.getAll();
    const index = orders.findIndex(o => o.id === id);
    
    if (index === -1) {
      throw new Error('Ordine non trovato');
    }
    
    const updatedOrder = {
      ...orders[index],
      ...updates,
    };
    
    orders[index] = updatedOrder;
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    
    return updatedOrder;
  },
  
  delete: async (id: string): Promise<void> => {
    const orders = await ordersApi.getAll();
    const filteredOrders = orders.filter(o => o.id !== id);
    
    if (filteredOrders.length === orders.length) {
      throw new Error('Ordine non trovato');
    }
    
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(filteredOrders));
  }
};

export default { vehiclesApi, quotesApi, ordersApi };
