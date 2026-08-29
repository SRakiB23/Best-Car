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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_interactions: {
        Row: {
          created_at: string
          error: string | null
          feature: string
          id: string
          latency_ms: number | null
          model: string
          request: Json
          response: Json | null
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error?: string | null
          feature: string
          id?: string
          latency_ms?: number | null
          model: string
          request: Json
          response?: Json | null
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error?: string | null
          feature?: string
          id?: string
          latency_ms?: number | null
          model?: string
          request?: Json
          response?: Json | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          days: number | null
          end_date: string
          id: string
          idempotency_key: string | null
          pickup_location: string
          price_per_day: number
          reference: string
          start_date: string
          status: Database["public"]["Enums"]["booking_status"]
          total_amount: number
          user_id: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          days?: number | null
          end_date: string
          id?: string
          idempotency_key?: string | null
          pickup_location?: string
          price_per_day: number
          reference: string
          start_date: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount: number
          user_id?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          days?: number | null
          end_date?: string
          id?: string
          idempotency_key?: string | null
          pickup_location?: string
          price_per_day?: number
          reference?: string
          start_date?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_amount?: number
          user_id?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "lead_list"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "product_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
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
      leads: {
        Row: {
          ai_interaction_id: string | null
          ai_summary: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          estimated_budget_amount: number | null
          estimated_budget_period: string | null
          id: string
          intent: string | null
          lead_score: number | null
          message: string
          missing_information: Json
          pickup_date: string | null
          priority: Database["public"]["Enums"]["lead_priority"] | null
          qualification_model: string | null
          qualified_at: string | null
          recommended_action: string | null
          rental_duration_days: number | null
          rental_duration_label: string | null
          return_date: string | null
          source: string
          status: Database["public"]["Enums"]["lead_status"]
          urgency: string | null
          user_id: string | null
          vehicle_id: string | null
          vehicle_preference: string | null
          vehicle_preference_category: string | null
        }
        Insert: {
          ai_interaction_id?: string | null
          ai_summary?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string
          estimated_budget_amount?: number | null
          estimated_budget_period?: string | null
          id?: string
          intent?: string | null
          lead_score?: number | null
          message: string
          missing_information?: Json
          pickup_date?: string | null
          priority?: Database["public"]["Enums"]["lead_priority"] | null
          qualification_model?: string | null
          qualified_at?: string | null
          recommended_action?: string | null
          rental_duration_days?: number | null
          rental_duration_label?: string | null
          return_date?: string | null
          source?: string
          status?: Database["public"]["Enums"]["lead_status"]
          urgency?: string | null
          user_id?: string | null
          vehicle_id?: string | null
          vehicle_preference?: string | null
          vehicle_preference_category?: string | null
        }
        Update: {
          ai_interaction_id?: string | null
          ai_summary?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          estimated_budget_amount?: number | null
          estimated_budget_period?: string | null
          id?: string
          intent?: string | null
          lead_score?: number | null
          message?: string
          missing_information?: Json
          pickup_date?: string | null
          priority?: Database["public"]["Enums"]["lead_priority"] | null
          qualification_model?: string | null
          qualified_at?: string | null
          recommended_action?: string | null
          rental_duration_days?: number | null
          rental_duration_label?: string | null
          return_date?: string | null
          source?: string
          status?: Database["public"]["Enums"]["lead_status"]
          urgency?: string | null
          user_id?: string | null
          vehicle_id?: string | null
          vehicle_preference?: string | null
          vehicle_preference_category?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_ai_interaction_id_fkey"
            columns: ["ai_interaction_id"]
            isOneToOne: false
            referencedRelation: "ai_interactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "lead_list"
            referencedColumns: ["vehicle_id"]
          },
          {
            foreignKeyName: "leads_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "product_list"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
          link: string
          read_at: string | null
          title: string
        }
        Insert: {
          created_at?: string
          detail: string
          id?: string
          link?: string
          read_at?: string | null
          title: string
        }
        Update: {
          created_at?: string
          detail?: string
          id?: string
          link?: string
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
            referencedRelation: "lead_list"
            referencedColumns: ["vehicle_id"]
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
          category: string
          created_at: string
          fuel_type: string
          id: string
          image_url: string
          luggage_capacity: number
          name: string
          price: number
          seats: number
          stock: number
          transmission: string
        }
        Insert: {
          category?: string
          created_at?: string
          fuel_type?: string
          id?: string
          image_url?: string
          luggage_capacity?: number
          name: string
          price: number
          seats?: number
          stock?: number
          transmission?: string
        }
        Update: {
          category?: string
          created_at?: string
          fuel_type?: string
          id?: string
          image_url?: string
          luggage_capacity?: number
          name?: string
          price?: number
          seats?: number
          stock?: number
          transmission?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string
          email: string
          full_name: string
          id: string
          is_staff: boolean
          phone: string
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string
          email?: string
          full_name?: string
          id: string
          is_staff?: boolean
          phone?: string
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string
          email?: string
          full_name?: string
          id?: string
          is_staff?: boolean
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
      booking_list: {
        Row: {
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          days: number | null
          end_date: string | null
          id: string | null
          pickup_location: string | null
          price_per_day: number | null
          reference: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number | null
          user_id: string | null
          vehicle_category: string | null
          vehicle_image: string | null
          vehicle_name: string | null
        }
        Relationships: []
      }
      lead_list: {
        Row: {
          ai_summary: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          estimated_budget_amount: number | null
          estimated_budget_period: string | null
          id: string | null
          intent: string | null
          lead_score: number | null
          message: string | null
          missing_information: Json | null
          pickup_date: string | null
          priority: Database["public"]["Enums"]["lead_priority"] | null
          qualification_model: string | null
          qualified_at: string | null
          recommended_action: string | null
          rental_duration_days: number | null
          rental_duration_label: string | null
          return_date: string | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          urgency: string | null
          user_id: string | null
          vehicle_category: string | null
          vehicle_id: string | null
          vehicle_image: string | null
          vehicle_name: string | null
          vehicle_preference: string | null
          vehicle_preference_category: string | null
        }
        Relationships: []
      }
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
      apply_lead_qualification: {
        Args: {
          p_interaction_id?: string
          p_lead_id: string
          p_model: string
          p_result: Json
        }
        Returns: Json
      }
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
      booking_payload: { Args: { p_reference: string }; Returns: Json }
      booking_reference: { Args: never; Returns: string }
      cancel_booking: { Args: { p_reference: string }; Returns: Json }
      country_sales: {
        Args: { window_days: number }
        Returns: {
          code: string
          name: string
          sales: number
        }[]
      }
      create_booking: {
        Args: {
          p_email: string
          p_end: string
          p_idempotency_key?: string
          p_location?: string
          p_name: string
          p_phone: string
          p_start: string
          p_vehicle_id: string
        }
        Returns: Json
      }
      create_lead: {
        Args: {
          p_email: string
          p_message: string
          p_name: string
          p_phone?: string
          p_pickup_date?: string
          p_return_date?: string
          p_source?: string
          p_vehicle_id?: string
        }
        Returns: Json
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
      is_staff: { Args: never; Returns: boolean }
      lead_payload: { Args: { p_lead_id: string }; Returns: Json }
      log_ai_interaction: {
        Args: {
          p_error?: string
          p_feature: string
          p_latency_ms?: number
          p_model: string
          p_request: Json
          p_response?: Json
          p_status?: string
          p_user_id?: string
        }
        Returns: string
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
      set_lead_status: {
        Args: { p_lead_id: string; p_status: string }
        Returns: Json
      }
      vehicle_booked_ranges: {
        Args: { p_vehicle_id: string }
        Returns: {
          end_date: string
          start_date: string
        }[]
      }
      vehicle_candidates: {
        Args: {
          p_category?: string
          p_end?: string
          p_limit?: number
          p_max_price_per_day?: number
          p_min_luggage?: number
          p_min_seats?: number
          p_start?: string
          p_transmission?: string
        }
        Returns: {
          available: boolean
          category: string
          fuel_type: string
          id: string
          image_url: string
          luggage_capacity: number
          name: string
          price_per_day: number
          seats: number
          transmission: string
        }[]
      }
      vehicle_is_available: {
        Args: { p_end: string; p_start: string; p_vehicle_id: string }
        Returns: boolean
      }
    }
    Enums: {
      booking_status: "confirmed" | "cancelled"
      lead_priority: "low" | "medium" | "high"
      lead_status: "new" | "qualified" | "contacted" | "closed"
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
      booking_status: ["confirmed", "cancelled"],
      lead_priority: ["low", "medium", "high"],
      lead_status: ["new", "qualified", "contacted", "closed"],
      order_status: ["success", "pending", "cancelled"],
    },
  },
} as const
