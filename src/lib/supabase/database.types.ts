export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      countries: {
        Row: {
          code: string
          name: string
        }
        Insert: {
          code: string
          name: string
        }
        Update: {
          code?: string
          name?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string
          id: string
          preview: string
          read_at: string | null
          sender: string
        }
        Insert: {
          created_at?: string
          id?: string
          preview: string
          read_at?: string | null
          sender: string
        }
        Update: {
          created_at?: string
          id?: string
          preview?: string
          read_at?: string | null
          sender?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          detail: string
          id: string
          read_at: string | null
          title: string
        }
        Insert: {
          created_at?: string
          detail: string
          id?: string
          read_at?: string | null
          title: string
        }
        Update: {
          created_at?: string
          detail?: string
          id?: string
          read_at?: string | null
          title?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          country_code: string | null
          id: string
          payment_method: string
          placed_at: string
          product_id: string
          quantity: number
          reference: string
          status: Database["public"]["Enums"]["order_status"]
          store_id: string | null
        }
        Insert: {
          amount: number
          country_code?: string | null
          id?: string
          payment_method: string
          placed_at?: string
          product_id: string
          quantity?: number
          reference: string
          status?: Database["public"]["Enums"]["order_status"]
          store_id?: string | null
        }
        Update: {
          amount?: number
          country_code?: string | null
          id?: string
          payment_method?: string
          placed_at?: string
          product_id?: string
          quantity?: number
          reference?: string
          status?: Database["public"]["Enums"]["order_status"]
          store_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          archived_at: string | null
          category: string
          created_at: string
          id: string
          image_url: string
          name: string
          price: number
          stock: number
        }
        Insert: {
          archived_at?: string | null
          category?: string
          created_at?: string
          id?: string
          image_url?: string
          name: string
          price: number
          stock?: number
        }
        Update: {
          archived_at?: string | null
          category?: string
          created_at?: string
          id?: string
          image_url?: string
          name?: string
          price?: number
          stock?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string
          email: string
          full_name: string
          id: string
          phone: string
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string
          email?: string
          full_name?: string
          id: string
          phone?: string
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          id: string
          location: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          id?: string
          location: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          id?: string
          location?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          currency: string
          locale: string
          low_stock_threshold: number
          store_name: string
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          currency?: string
          locale?: string
          low_stock_threshold?: number
          store_name?: string
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          currency?: string
          locale?: string
          low_stock_threshold?: number
          store_name?: string
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      order_list: {
        Row: {
          amount: number | null
          id: string | null
          payment_method: string | null
          placed_at: string | null
          product_image: string | null
          product_name: string | null
          reference: string | null
          status: Database["public"]["Enums"]["order_status"] | null
        }
        Relationships: []
      }
      product_list: {
        Row: {
          category: string | null
          id: string | null
          image_url: string | null
          name: string | null
          price: number | null
          revenue: number | null
          sales: number | null
          stock: number | null
        }
        Relationships: []
      }
      recent_order_list: {
        Row: {
          amount: number | null
          id: string | null
          payment_method: string | null
          placed_at: string | null
          product_image: string | null
          product_name: string | null
          reference: string | null
          status: Database["public"]["Enums"]["order_status"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      best_sellers: {
        Args: { max_rows: number; window_days: number }
        Returns: {
          id: string
          image_url: string
          name: string
          price: number
          sales: number
        }[]
      }
      country_sales: {
        Args: { window_days: number }
        Returns: {
          code: string
          name: string
          sales: number
        }[]
      }
      earning_summary: {
        Args: { window_days: number }
        Returns: {
          direction: string
          percent: number
          purchased_goods: number
          revenue: number
          total_sales: number
        }[]
      }
      sales_analytics: {
        Args: { target_year: number }
        Returns: {
          month_label: string
          total: number
        }[]
      }
      sales_trend: {
        Args: { window_days: number }
        Returns: {
          direction: string
          percent: number
        }[]
      }
    }
    Enums: {
      order_status: "success" | "pending" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      order_status: ["success", "pending", "cancelled"],
    },
  },
} as const
