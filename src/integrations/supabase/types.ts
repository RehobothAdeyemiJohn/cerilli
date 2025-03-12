export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          active: boolean | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_login: string | null
          last_name: string
          password: string
          permissions: string[] | null
          role: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          last_login?: string | null
          last_name: string
          password: string
          permissions?: string[] | null
          role: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_login?: string | null
          last_name?: string
          password?: string
          permissions?: string[] | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      dealers: {
        Row: {
          address: string
          city: string
          companyname: string
          contactname: string
          created_at: string | null
          email: string
          id: string
          isactive: boolean | null
          password: string
          province: string
          updated_at: string | null
          zipcode: string
        }
        Insert: {
          address: string
          city: string
          companyname: string
          contactname: string
          created_at?: string | null
          email: string
          id: string
          isactive?: boolean | null
          password: string
          province: string
          updated_at?: string | null
          zipcode: string
        }
        Update: {
          address?: string
          city?: string
          companyname?: string
          contactname?: string
          created_at?: string | null
          email?: string
          id?: string
          isactive?: boolean | null
          password?: string
          province?: string
          updated_at?: string | null
          zipcode?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          customername: string
          dealerid: string
          deliverydate: string | null
          id: string
          notes: string | null
          orderdate: string | null
          quoteid: string | null
          status: string | null
          updated_at: string | null
          vehicleid: string
        }
        Insert: {
          customername: string
          dealerid: string
          deliverydate?: string | null
          id?: string
          notes?: string | null
          orderdate?: string | null
          quoteid?: string | null
          status?: string | null
          updated_at?: string | null
          vehicleid: string
        }
        Update: {
          customername?: string
          dealerid?: string
          deliverydate?: string | null
          id?: string
          notes?: string | null
          orderdate?: string | null
          quoteid?: string | null
          status?: string | null
          updated_at?: string | null
          vehicleid?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_dealerid_fkey"
            columns: ["dealerid"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_quoteid_fkey"
            columns: ["quoteid"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_vehicleid_fkey"
            columns: ["vehicleid"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          createdat: string | null
          customeremail: string | null
          customername: string
          customerphone: string | null
          dealerid: string
          discount: number | null
          finalprice: number
          id: string
          manualentry: boolean | null
          notes: string | null
          price: number
          rejectionreason: string | null
          status: string | null
          updated_at: string | null
          vehicleid: string
        }
        Insert: {
          createdat?: string | null
          customeremail?: string | null
          customername: string
          customerphone?: string | null
          dealerid: string
          discount?: number | null
          finalprice: number
          id?: string
          manualentry?: boolean | null
          notes?: string | null
          price: number
          rejectionreason?: string | null
          status?: string | null
          updated_at?: string | null
          vehicleid: string
        }
        Update: {
          createdat?: string | null
          customeremail?: string | null
          customername?: string
          customerphone?: string | null
          dealerid?: string
          discount?: number | null
          finalprice?: number
          id?: string
          manualentry?: boolean | null
          notes?: string | null
          price?: number
          rejectionreason?: string | null
          status?: string | null
          updated_at?: string | null
          vehicleid?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_dealerid_fkey"
            columns: ["dealerid"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_vehicleid_fkey"
            columns: ["vehicleid"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      settings_accessories: {
        Row: {
          compatible_models: string[] | null
          compatible_trims: string[] | null
          created_at: string | null
          id: string
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          compatible_models?: string[] | null
          compatible_trims?: string[] | null
          created_at?: string | null
          id?: string
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          compatible_models?: string[] | null
          compatible_trims?: string[] | null
          created_at?: string | null
          id?: string
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      settings_colors: {
        Row: {
          compatible_models: string[] | null
          created_at: string | null
          id: string
          name: string
          price_adjustment: number
          type: string
          updated_at: string | null
        }
        Insert: {
          compatible_models?: string[] | null
          created_at?: string | null
          id?: string
          name: string
          price_adjustment: number
          type: string
          updated_at?: string | null
        }
        Update: {
          compatible_models?: string[] | null
          created_at?: string | null
          id?: string
          name?: string
          price_adjustment?: number
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      settings_fuel_types: {
        Row: {
          compatible_models: string[] | null
          created_at: string | null
          id: string
          name: string
          price_adjustment: number
          updated_at: string | null
        }
        Insert: {
          compatible_models?: string[] | null
          created_at?: string | null
          id?: string
          name: string
          price_adjustment: number
          updated_at?: string | null
        }
        Update: {
          compatible_models?: string[] | null
          created_at?: string | null
          id?: string
          name?: string
          price_adjustment?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      settings_models: {
        Row: {
          base_price: number
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          base_price: number
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      settings_transmissions: {
        Row: {
          compatible_models: string[] | null
          created_at: string | null
          id: string
          name: string
          price_adjustment: number
          updated_at: string | null
        }
        Insert: {
          compatible_models?: string[] | null
          created_at?: string | null
          id?: string
          name: string
          price_adjustment: number
          updated_at?: string | null
        }
        Update: {
          compatible_models?: string[] | null
          created_at?: string | null
          id?: string
          name?: string
          price_adjustment?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      settings_trims: {
        Row: {
          compatible_models: string[] | null
          created_at: string | null
          id: string
          name: string
          price_adjustment: number
          updated_at: string | null
        }
        Insert: {
          compatible_models?: string[] | null
          created_at?: string | null
          id?: string
          name: string
          price_adjustment: number
          updated_at?: string | null
        }
        Update: {
          compatible_models?: string[] | null
          created_at?: string | null
          id?: string
          name?: string
          price_adjustment?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          accessories: string[] | null
          created_at: string | null
          dateadded: string
          exteriorcolor: string | null
          fueltype: string | null
          id: string
          imageurl: string | null
          location: string
          model: string
          price: number | null
          reservedaccessories: string[] | null
          reservedby: string | null
          status: string | null
          telaio: string | null
          transmission: string | null
          trim: string | null
          updated_at: string | null
          virtualconfig: Json | null
        }
        Insert: {
          accessories?: string[] | null
          created_at?: string | null
          dateadded: string
          exteriorcolor?: string | null
          fueltype?: string | null
          id: string
          imageurl?: string | null
          location: string
          model: string
          price?: number | null
          reservedaccessories?: string[] | null
          reservedby?: string | null
          status?: string | null
          telaio?: string | null
          transmission?: string | null
          trim?: string | null
          updated_at?: string | null
          virtualconfig?: Json | null
        }
        Update: {
          accessories?: string[] | null
          created_at?: string | null
          dateadded?: string
          exteriorcolor?: string | null
          fueltype?: string | null
          id?: string
          imageurl?: string | null
          location?: string
          model?: string
          price?: number | null
          reservedaccessories?: string[] | null
          reservedby?: string | null
          status?: string | null
          telaio?: string | null
          transmission?: string | null
          trim?: string | null
          updated_at?: string | null
          virtualconfig?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_dealers_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_orders_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_quotes_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_vehicles_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_admin_user: {
        Args: {
          p_user_id: string
        }
        Returns: undefined
      }
      delete_dealer: {
        Args: {
          p_dealer_id: string
        }
        Returns: undefined
      }
      delete_model: {
        Args: {
          p_model_id: string
        }
        Returns: undefined
      }
      delete_order: {
        Args: {
          p_order_id: string
        }
        Returns: undefined
      }
      delete_quote: {
        Args: {
          p_quote_id: string
        }
        Returns: undefined
      }
      delete_vehicle: {
        Args: {
          p_vehicle_id: string
        }
        Returns: undefined
      }
      drop_dealers_table_if_exists: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      drop_orders_table_if_exists: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      drop_quotes_table_if_exists: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      drop_vehicles_table_if_exists: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_admin_user_by_email: {
        Args: {
          p_email: string
        }
        Returns: {
          active: boolean | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_login: string | null
          last_name: string
          password: string
          permissions: string[] | null
          role: string
          updated_at: string | null
        }[]
      }
      get_admin_user_by_id: {
        Args: {
          p_id: string
        }
        Returns: {
          active: boolean | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_login: string | null
          last_name: string
          password: string
          permissions: string[] | null
          role: string
          updated_at: string | null
        }[]
      }
      get_all_admin_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          active: boolean | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_login: string | null
          last_name: string
          password: string
          permissions: string[] | null
          role: string
          updated_at: string | null
        }[]
      }
      insert_admin_user: {
        Args: {
          p_first_name: string
          p_last_name: string
          p_email: string
          p_password: string
          p_role: string
          p_permissions?: string[]
          p_active?: boolean
        }
        Returns: string
      }
      insert_dealer: {
        Args: {
          p_companyname: string
          p_address: string
          p_city: string
          p_province: string
          p_zipcode: string
          p_contactname: string
          p_email: string
          p_password: string
          p_isactive?: boolean
        }
        Returns: string
      }
      insert_model: {
        Args: {
          p_name: string
          p_base_price: number
        }
        Returns: string
      }
      insert_order: {
        Args: {
          p_vehicleid: string
          p_dealerid: string
          p_customername: string
          p_quoteid?: string
          p_status?: string
          p_orderdate?: string
          p_deliverydate?: string
        }
        Returns: string
      }
      insert_quote: {
        Args: {
          p_vehicleid: string
          p_dealerid: string
          p_customername: string
          p_price: number
          p_finalprice: number
          p_customeremail?: string
          p_customerphone?: string
          p_discount?: number
          p_status?: string
          p_createdat?: string
        }
        Returns: string
      }
      insert_vehicle: {
        Args: {
          p_model: string
          p_location: string
          p_trim?: string
          p_fueltype?: string
          p_exteriorcolor?: string
          p_accessories?: string[]
          p_price?: number
          p_imageurl?: string
          p_status?: string
          p_dateadded?: string
          p_telaio?: string
          p_transmission?: string
          p_reservedby?: string
          p_reservedaccessories?: string[]
          p_virtualconfig?: Json
        }
        Returns: string
      }
      list_tables: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
        }[]
      }
      update_admin_user: {
        Args: {
          p_user_id: string
          p_first_name?: string
          p_last_name?: string
          p_email?: string
          p_password?: string
          p_role?: string
          p_permissions?: string[]
          p_active?: boolean
          p_last_login?: string
        }
        Returns: undefined
      }
      update_dealer: {
        Args: {
          p_dealer_id: string
          p_companyname?: string
          p_address?: string
          p_city?: string
          p_province?: string
          p_zipcode?: string
          p_contactname?: string
          p_email?: string
          p_password?: string
          p_isactive?: boolean
        }
        Returns: undefined
      }
      update_model: {
        Args: {
          p_model_id: string
          p_name?: string
          p_base_price?: number
        }
        Returns: undefined
      }
      update_order: {
        Args: {
          p_order_id: string
          p_vehicleid?: string
          p_dealerid?: string
          p_quoteid?: string
          p_customername?: string
          p_status?: string
          p_orderdate?: string
          p_deliverydate?: string
        }
        Returns: undefined
      }
      update_quote: {
        Args: {
          p_quote_id: string
          p_vehicleid?: string
          p_dealerid?: string
          p_customername?: string
          p_customeremail?: string
          p_customerphone?: string
          p_price?: number
          p_discount?: number
          p_finalprice?: number
          p_status?: string
        }
        Returns: undefined
      }
      update_vehicle: {
        Args: {
          p_vehicle_id: string
          p_model?: string
          p_trim?: string
          p_fueltype?: string
          p_exteriorcolor?: string
          p_accessories?: string[]
          p_price?: number
          p_location?: string
          p_imageurl?: string
          p_status?: string
          p_dateadded?: string
          p_telaio?: string
          p_transmission?: string
          p_reservedby?: string
          p_reservedaccessories?: string[]
          p_virtualconfig?: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
