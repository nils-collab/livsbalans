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
      countries: {
        Row: {
          code: string
          created_at: string | null
          currency_code: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          currency_code: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          currency_code?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      creative_products: {
        Row: {
          created_at: string | null
          creative_id: string
          id: string
          product_id: string
        }
        Insert: {
          created_at?: string | null
          creative_id: string
          id?: string
          product_id: string
        }
        Update: {
          created_at?: string | null
          creative_id?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creative_products_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "creatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creative_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      creatives: {
        Row: {
          country_id: string
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          country_id: string
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          country_id?: string
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creatives_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          country_id: string
          created_at: string | null
          id: string
          month: string
          rate_to_eur: number
          updated_at: string | null
        }
        Insert: {
          country_id: string
          created_at?: string | null
          id?: string
          month: string
          rate_to_eur: number
          updated_at?: string | null
        }
        Update: {
          country_id?: string
          created_at?: string | null
          id?: string
          month?: string
          rate_to_eur?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exchange_rates_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      media_channels: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      media_spend: {
        Row: {
          amount_local: number
          channel_id: string
          country_id: string
          created_at: string | null
          creative_id: string | null
          distribute_evenly: boolean | null
          id: string
          month: string
          notes: string | null
          sub_channel_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount_local: number
          channel_id: string
          country_id: string
          created_at?: string | null
          creative_id?: string | null
          distribute_evenly?: boolean | null
          id?: string
          month: string
          notes?: string | null
          sub_channel_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_local?: number
          channel_id?: string
          country_id?: string
          created_at?: string | null
          creative_id?: string | null
          distribute_evenly?: boolean | null
          id?: string
          month?: string
          notes?: string | null
          sub_channel_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_spend_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "media_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_spend_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_spend_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "creatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_spend_sub_channel_id_fkey"
            columns: ["sub_channel_id"]
            isOneToOne: false
            referencedRelation: "media_sub_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      media_spend_products: {
        Row: {
          allocated_amount_local: number
          created_at: string | null
          id: string
          media_spend_id: string
          product_id: string
        }
        Insert: {
          allocated_amount_local: number
          created_at?: string | null
          id?: string
          media_spend_id: string
          product_id: string
        }
        Update: {
          allocated_amount_local?: number
          created_at?: string | null
          id?: string
          media_spend_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_spend_products_media_spend_id_fkey"
            columns: ["media_spend_id"]
            isOneToOne: false
            referencedRelation: "media_spend"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_spend_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      media_sub_channels: {
        Row: {
          channel_id: string
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          channel_id: string
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          channel_id?: string
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_sub_channels_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "media_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      product_group_members: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          product_id: string
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          product_id: string
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "product_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_group_members_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_groups: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          cogs_eur: number
          created_at: string | null
          id: string
          name: string
          sku: string | null
          updated_at: string | null
        }
        Insert: {
          cogs_eur?: number
          created_at?: string | null
          id?: string
          name: string
          sku?: string | null
          updated_at?: string | null
        }
        Update: {
          cogs_eur?: number
          created_at?: string | null
          id?: string
          name?: string
          sku?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sales: {
        Row: {
          country_id: string
          created_at: string | null
          id: string
          month: string
          notes: string | null
          product_id: string
          revenue_local: number
          sales_channel_id: string
          units: number
          updated_at: string | null
        }
        Insert: {
          country_id: string
          created_at?: string | null
          id?: string
          month: string
          notes?: string | null
          product_id: string
          revenue_local: number
          sales_channel_id: string
          units?: number
          updated_at?: string | null
        }
        Update: {
          country_id?: string
          created_at?: string | null
          id?: string
          month?: string
          notes?: string | null
          product_id?: string
          revenue_local?: number
          sales_channel_id?: string
          units?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_sales_channel_id_fkey"
            columns: ["sales_channel_id"]
            isOneToOne: false
            referencedRelation: "sales_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_channels: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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


