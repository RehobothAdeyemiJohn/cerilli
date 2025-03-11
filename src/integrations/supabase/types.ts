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
      list_tables: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
        }[]
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
