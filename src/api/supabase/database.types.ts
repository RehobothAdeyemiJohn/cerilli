
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
          notes?: string
          rejectionreason?: string
          manualentry?: boolean
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
          notes?: string
          rejectionreason?: string
          manualentry?: boolean
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
          notes?: string
          rejectionreason?: string
          manualentry?: boolean
        }
      }
      orders: {
        Row: {
          id: string
          progressive_number: number
          vehicle_id: string | null
          dealer_id: string | null
          dealer_name: string | null
          customer_name: string
          model_name: string | null
          status: string | null
          order_date: string | null
          delivery_date: string | null
          price: number | null
          plafond_dealer: number | null
          is_licensable: boolean | null
          has_proforma: boolean | null
          is_paid: boolean | null
          payment_date: string | null
          is_invoiced: boolean | null
          invoice_number: string | null
          invoice_date: string | null
          has_conformity: boolean | null
          previous_chassis: string | null
          chassis: string | null
          transport_costs: number | null
          restoration_costs: number | null
          funding_type: string | null
          odl_generated: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          progressive_number?: number
          vehicle_id?: string | null
          dealer_id?: string | null
          dealer_name?: string | null
          customer_name: string
          model_name?: string | null
          status?: string | null
          order_date?: string | null
          delivery_date?: string | null
          price?: number | null
          plafond_dealer?: number | null
          is_licensable?: boolean | null
          has_proforma?: boolean | null
          is_paid?: boolean | null
          payment_date?: string | null
          is_invoiced?: boolean | null
          invoice_number?: string | null
          invoice_date?: string | null
          has_conformity?: boolean | null
          previous_chassis?: string | null
          chassis?: string | null
          transport_costs?: number | null
          restoration_costs?: number | null
          funding_type?: string | null
          odl_generated?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          progressive_number?: number
          vehicle_id?: string | null
          dealer_id?: string | null
          dealer_name?: string | null
          customer_name?: string
          model_name?: string | null
          status?: string | null
          order_date?: string | null
          delivery_date?: string | null
          price?: number | null
          plafond_dealer?: number | null
          is_licensable?: boolean | null
          has_proforma?: boolean | null
          is_paid?: boolean | null
          payment_date?: string | null
          is_invoiced?: boolean | null
          invoice_number?: string | null
          invoice_date?: string | null
          has_conformity?: boolean | null
          previous_chassis?: string | null
          chassis?: string | null
          transport_costs?: number | null
          restoration_costs?: number | null
          funding_type?: string | null
          odl_generated?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
  }
}
