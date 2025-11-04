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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      customer_service_reports: {
        Row: {
          air_fresheners: number | null
          comments: string | null
          created_at: string
          grit_soap: number | null
          hand_sanitisers: number | null
          hand_soap: number | null
          id: string
          medical_bins: number | null
          nappy_bins: number | null
          others: number | null
          pedal_bins: number | null
          run_id: string
          s_officer_sig: string | null
          sanitary_bins: number | null
          sanitising_wipes: number | null
          sensor_bins: number | null
          service_id: string | null
          sharps_1_4lt_8lt: number | null
          tech_sig: string | null
          toilet_seat_sprays: number | null
          updated_at: string
          urinal_mats: number | null
          urinal_sanitisers: number | null
          urinal_treatment: number | null
          wc_sanitisers: number | null
        }
        Insert: {
          air_fresheners?: number | null
          comments?: string | null
          created_at?: string
          grit_soap?: number | null
          hand_sanitisers?: number | null
          hand_soap?: number | null
          id?: string
          medical_bins?: number | null
          nappy_bins?: number | null
          others?: number | null
          pedal_bins?: number | null
          run_id: string
          s_officer_sig?: string | null
          sanitary_bins?: number | null
          sanitising_wipes?: number | null
          sensor_bins?: number | null
          service_id?: string | null
          sharps_1_4lt_8lt?: number | null
          tech_sig?: string | null
          toilet_seat_sprays?: number | null
          updated_at?: string
          urinal_mats?: number | null
          urinal_sanitisers?: number | null
          urinal_treatment?: number | null
          wc_sanitisers?: number | null
        }
        Update: {
          air_fresheners?: number | null
          comments?: string | null
          created_at?: string
          grit_soap?: number | null
          hand_sanitisers?: number | null
          hand_soap?: number | null
          id?: string
          medical_bins?: number | null
          nappy_bins?: number | null
          others?: number | null
          pedal_bins?: number | null
          run_id?: string
          s_officer_sig?: string | null
          sanitary_bins?: number | null
          sanitising_wipes?: number | null
          sensor_bins?: number | null
          service_id?: string | null
          sharps_1_4lt_8lt?: number | null
          tech_sig?: string | null
          toilet_seat_sprays?: number | null
          updated_at?: string
          urinal_mats?: number | null
          urinal_sanitisers?: number | null
          urinal_treatment?: number | null
          wc_sanitisers?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_run_id"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "runs"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          contract_date: string | null
          contract_notes: string | null
          created_at: string | null
          date_cancel: string | null
          delete_tag: boolean | null
          id: string
          notes: string | null
          postal_address: string | null
          service_id: string
          site_accounts_contact: string | null
          site_contact_first_name: string | null
          site_contact_lastname: string | null
          site_email_address: string | null
          site_fax_no: string | null
          site_name: string
          site_pobox: string | null
          site_post_code: string | null
          site_street_name: string | null
          site_suburb: string | null
          site_telephone_no1: string | null
          site_telephone_no2: string | null
          updated_at: string | null
        }
        Insert: {
          contract_date?: string | null
          contract_notes?: string | null
          created_at?: string | null
          date_cancel?: string | null
          delete_tag?: boolean | null
          id?: string
          notes?: string | null
          postal_address?: string | null
          service_id: string
          site_accounts_contact?: string | null
          site_contact_first_name?: string | null
          site_contact_lastname?: string | null
          site_email_address?: string | null
          site_fax_no?: string | null
          site_name: string
          site_pobox?: string | null
          site_post_code?: string | null
          site_street_name?: string | null
          site_suburb?: string | null
          site_telephone_no1?: string | null
          site_telephone_no2?: string | null
          updated_at?: string | null
        }
        Update: {
          contract_date?: string | null
          contract_notes?: string | null
          created_at?: string | null
          date_cancel?: string | null
          delete_tag?: boolean | null
          id?: string
          notes?: string | null
          postal_address?: string | null
          service_id?: string
          site_accounts_contact?: string | null
          site_contact_first_name?: string | null
          site_contact_lastname?: string | null
          site_email_address?: string | null
          site_fax_no?: string | null
          site_name?: string
          site_pobox?: string | null
          site_post_code?: string | null
          site_street_name?: string | null
          site_suburb?: string | null
          site_telephone_no1?: string | null
          site_telephone_no2?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      runs: {
        Row: {
          clients: string | null
          completed: boolean | null
          created_at: string | null
          frequency: string | null
          id: string
          products: string | null
          service_id: string
          suburb: string | null
          technicians: string | null
          updated_at: string | null
          week_day: string | null
          weeks: string | null
        }
        Insert: {
          clients?: string | null
          completed?: boolean | null
          created_at?: string | null
          frequency?: string | null
          id?: string
          products?: string | null
          service_id: string
          suburb?: string | null
          technicians?: string | null
          updated_at?: string | null
          week_day?: string | null
          weeks?: string | null
        }
        Update: {
          clients?: string | null
          completed?: boolean | null
          created_at?: string | null
          frequency?: string | null
          id?: string
          products?: string | null
          service_id?: string
          suburb?: string | null
          technicians?: string | null
          updated_at?: string | null
          week_day?: string | null
          weeks?: string | null
        }
        Relationships: []
      }
      service_agreements: {
        Row: {
          areas_covered: string | null
          comments: string | null
          cpi: number | null
          cpm_device_onsite: string | null
          cpm_pricing: number | null
          created_at: string | null
          id: string
          invoice_type: string | null
          products: string | null
          service_active_inactive: string | null
          service_frequency: string | null
          service_id: string
          total: number | null
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          areas_covered?: string | null
          comments?: string | null
          cpi?: number | null
          cpm_device_onsite?: string | null
          cpm_pricing?: number | null
          created_at?: string | null
          id?: string
          invoice_type?: string | null
          products?: string | null
          service_active_inactive?: string | null
          service_frequency?: string | null
          service_id: string
          total?: number | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          areas_covered?: string | null
          comments?: string | null
          cpi?: number | null
          cpm_device_onsite?: string | null
          cpm_pricing?: number | null
          created_at?: string | null
          id?: string
          invoice_type?: string | null
          products?: string | null
          service_active_inactive?: string | null
          service_frequency?: string | null
          service_id?: string
          total?: number | null
          unit_price?: number | null
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
    Enums: {},
  },
} as const
