
import { supabase } from '@/api/supabase/client';

export const createDefaultAdmin = async () => {
  // Check if there are any admin users
  const { data, error } = await supabase.rpc('get_all_admin_users');
  
  if (error) {
    console.error('Error checking for admin users:', error);
    return;
  }
  
  // If there are no admin users, create a default one
  if (!data || data.length === 0) {
    console.log('Creating default admin user...');
    
    try {
      const { data: newAdmin, error: createError } = await supabase
        .from('admin_users')
        .insert({
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@example.com',
          password: 'password123',
          role: 'superAdmin',
          permissions: ['dashboard', 'inventory', 'quotes', 'orders', 'dealers', 'credentials', 'settings'],
          active: true
        })
        .select();
      
      if (createError) {
        console.error('Error creating default admin:', createError);
      } else {
        console.log('Default admin created successfully:', newAdmin);
      }
    } catch (err) {
      console.error('Exception creating default admin:', err);
    }
  } else {
    console.log('Admin users already exist, skipping default admin creation.');
  }
};
