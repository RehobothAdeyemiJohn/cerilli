
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      vehicles: {
        Row: {
          id: string
          model: string
          trim: string | null
          fuelType: string | null
          exteriorColor: string | null
          accessories: string[] | null
          price: number | null
          location: string
          imageUrl: string | null
          status: string
          dateAdded: string
          telaio: string | null
          transmission: string | null
          reservedBy: string | null
          reservedAccessories: string[] | null
          virtualConfig: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          model: string
          trim?: string | null
          fuelType?: string | null
          exteriorColor?: string | null
          accessories?: string[] | null
          price?: number | null
          location: string
          imageUrl?: string | null
          status?: string
          dateAdded?: string
          telaio?: string | null
          transmission?: string | null
          reservedBy?: string | null
          reservedAccessories?: string[] | null
          virtualConfig?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          model?: string
          trim?: string | null
          fuelType?: string | null
          exteriorColor?: string | null
          accessories?: string[] | null
          price?: number | null
          location?: string
          imageUrl?: string | null
          status?: string
          dateAdded?: string
          telaio?: string | null
          transmission?: string | null
          reservedBy?: string | null
          reservedAccessories?: string[] | null
          virtualConfig?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      dealers: {
        Row: {
          id: string
          companyName: string
          address: string
          city: string
          province: string
          zipCode: string
          isActive: boolean
          contactName: string
          email: string
          password: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          companyName: string
          address: string
          city: string
          province: string
          zipCode: string
          isActive?: boolean
          contactName: string
          email: string
          password: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          companyName?: string
          address?: string
          city?: string
          province?: string
          zipCode?: string
          isActive?: boolean
          contactName?: string
          email?: string
          password?: string
          created_at?: string
          updated_at?: string
        }
      }
      quotes: {
        Row: {
          id: string
          vehicleId: string
          dealerId: string
          customerName: string
          customerEmail: string
          customerPhone: string
          price: number
          discount: number
          finalPrice: number
          status: string
          createdAt: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vehicleId: string
          dealerId: string
          customerName: string
          customerEmail: string
          customerPhone: string
          price: number
          discount: number
          finalPrice: number
          status?: string
          createdAt?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicleId?: string
          dealerId?: string
          customerName?: string
          customerEmail?: string
          customerPhone?: string
          price?: number
          discount?: number
          finalPrice?: number
          status?: string
          createdAt?: string
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          vehicleId: string
          dealerId: string
          quoteId: string | null
          customerName: string
          status: string
          orderDate: string
          deliveryDate: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vehicleId: string
          dealerId: string
          quoteId?: string | null
          customerName: string
          status?: string
          orderDate?: string
          deliveryDate?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicleId?: string
          dealerId?: string
          quoteId?: string | null
          customerName?: string
          status?: string
          orderDate?: string
          deliveryDate?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
