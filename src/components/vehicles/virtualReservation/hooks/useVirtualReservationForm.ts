
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Vehicle } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { createVirtualReservationSchema, VirtualReservationFormValues } from '../schema';

export const useVirtualReservationForm = (vehicle: Vehicle) => {
  // Get user information
  const { user } = useAuth();
  const isAdmin = user?.type === 'admin';
  const dealerId = user?.dealerId || '';
  const dealerName = user?.dealerName || '';
  
  // Initialize form with the appropriate schema
  const reservationSchema = createVirtualReservationSchema(isAdmin);
  
  // Default values depend on user type
  const defaultValues: Partial<VirtualReservationFormValues> = {
    trim: '',
    fuelType: '',
    exteriorColor: '',
    transmission: '',
    accessories: [],
    reservationDestination: 'Conto Esposizione', // Fixed by using a valid value from the enum
  };
  
  // Add dealerId field only for admins
  if (isAdmin) {
    defaultValues.dealerId = '';
  }
  
  const form = useForm<VirtualReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues,
  });

  return {
    form,
    isAdmin,
    dealerId,
    dealerName
  };
};
