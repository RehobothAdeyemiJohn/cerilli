
import { Vehicle, Quote, Order } from '@/types';

// Keys for localStorage
export const KEYS = {
  VEHICLES: 'cirelli_vehicles',
  QUOTES: 'cirelli_quotes',
  ORDERS: 'cirelli_orders',
};

// Function to initialize local storage with sample data
export const initLocalStorage = () => {
  // Check if data already exists
  if (!localStorage.getItem(KEYS.VEHICLES)) {
    // Sample vehicles data
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
    // Sample quotes data
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
    // Sample orders data
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
