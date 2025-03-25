
import { supabase } from './client';
import { AdminUser, AdminUserFormData } from '@/types/admin';

export const adminUsersApi = {
  getAll: async (): Promise<AdminUser[]> => {
    const { data, error } = await supabase
      .rpc('get_all_admin_users');
    
    if (error) {
      console.error('Error fetching admin users:', error);
      throw error;
    }
    
    return data || [];
  },

  getById: async (id: string): Promise<AdminUser | undefined> => {
    const { data, error } = await supabase
      .rpc('get_admin_user_by_id', { p_id: id });
    
    if (error) {
      console.error('Error fetching admin user by ID:', error);
      throw error;
    }
    
    return data?.[0];
  },

  create: async (userData: AdminUserFormData): Promise<AdminUser> => {
    // Insert into admin_users table
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        permissions: userData.permissions,
        active: userData.active
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating admin user:', error);
      throw error;
    }
    
    // Transform the response to match our AdminUser type
    return {
      id: data.id,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      password: data.password,
      role: data.role,
      permissions: data.permissions,
      active: data.active,
      lastLogin: data.last_login,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  update: async (id: string, userData: Partial<AdminUserFormData>): Promise<AdminUser | undefined> => {
    // Prepare the update data with snake_case field names
    const updateData: any = {};
    if (userData.first_name !== undefined) updateData.first_name = userData.first_name;
    if (userData.last_name !== undefined) updateData.last_name = userData.last_name;
    if (userData.email !== undefined) updateData.email = userData.email;
    if (userData.password !== undefined) updateData.password = userData.password;
    if (userData.role !== undefined) updateData.role = userData.role;
    if (userData.permissions !== undefined) updateData.permissions = userData.permissions;
    if (userData.active !== undefined) updateData.active = userData.active;
    
    // Update the admin_users table
    const { data, error } = await supabase
      .from('admin_users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating admin user:', error);
      throw error;
    }
    
    if (!data) return undefined;
    
    // Transform the response to match our AdminUser type
    return {
      id: data.id,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      password: data.password,
      role: data.role,
      permissions: data.permissions,
      active: data.active,
      lastLogin: data.last_login,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting admin user:', error);
      throw error;
    }
    
    return true;
  },
  
  // Add a method to update the last login timestamp
  updateLastLogin: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }
};
