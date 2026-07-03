export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["user_role"];
          name: string;
          email: string;
          avatar_url: string | null;
          stripe_account_id: string | null;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: Database["public"]["Enums"]["user_role"];
          name: string;
          email: string;
          avatar_url?: string | null;
          stripe_account_id?: string | null;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: Database["public"]["Enums"]["user_role"];
          name?: string;
          email?: string;
          avatar_url?: string | null;
          stripe_account_id?: string | null;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      venues: {
        Row: {
          id: string;
          host_id: string;
          name: string;
          description: string;
          category: string;
          vibe: string | null;
          capacity: number;
          hourly_rate: number;
          images: string[];
          address: string;
          operating_hours: Json;
          active_status: Database["public"]["Enums"]["venue_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          host_id: string;
          name: string;
          description: string;
          category: string;
          vibe?: string | null;
          capacity: number;
          hourly_rate: number;
          images?: string[];
          address: string;
          operating_hours?: Json;
          active_status?: Database["public"]["Enums"]["venue_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          host_id?: string;
          name?: string;
          description?: string;
          category?: string;
          vibe?: string | null;
          capacity?: number;
          hourly_rate?: number;
          images?: string[];
          address?: string;
          operating_hours?: Json;
          active_status?: Database["public"]["Enums"]["venue_status"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "venues_host_id_fkey";
            columns: ["host_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      venue_use_cases: {
        Row: {
          id: string;
          venue_id: string;
          use_case: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          venue_id: string;
          use_case: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          venue_id?: string;
          use_case?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "venue_use_cases_venue_id_fkey";
            columns: ["venue_id"];
            isOneToOne: false;
            referencedRelation: "venues";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: {
          id: string;
          venue_id: string;
          renter_id: string;
          start_time: string;
          end_time: string;
          guest_count: number;
          use_case: string;
          total_price: number;
          platform_fee: number;
          stripe_payment_intent_id: string | null;
          status: Database["public"]["Enums"]["booking_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          venue_id: string;
          renter_id: string;
          start_time: string;
          end_time: string;
          guest_count: number;
          use_case: string;
          total_price: number;
          platform_fee: number;
          stripe_payment_intent_id?: string | null;
          status?: Database["public"]["Enums"]["booking_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          venue_id?: string;
          renter_id?: string;
          start_time?: string;
          end_time?: string;
          guest_count?: number;
          use_case?: string;
          total_price?: number;
          platform_fee?: number;
          stripe_payment_intent_id?: string | null;
          status?: Database["public"]["Enums"]["booking_status"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_renter_id_fkey";
            columns: ["renter_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_venue_id_fkey";
            columns: ["venue_id"];
            isOneToOne: false;
            referencedRelation: "venues";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          venue_id: string;
          renter_id: string;
          rating: number;
          comment: string;
          use_case_tag: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          venue_id: string;
          renter_id: string;
          rating: number;
          comment: string;
          use_case_tag: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          venue_id?: string;
          renter_id?: string;
          rating?: number;
          comment?: string;
          use_case_tag?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: true;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_renter_id_fkey";
            columns: ["renter_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_venue_id_fkey";
            columns: ["venue_id"];
            isOneToOne: false;
            referencedRelation: "venues";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          booking_id: string;
          sender_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          sender_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          sender_id?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      calculate_venue_readiness: {
        Args: { venue_row: Database["public"]["Tables"]["venues"]["Row"] };
        Returns: number;
      };
    };
    Enums: {
      user_role: "host" | "renter";
      venue_status: "draft" | "pending_review" | "active" | "paused" | "rejected";
      booking_status: "pending" | "approved" | "declined" | "captured" | "canceled";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<TableName extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][TableName]["Row"];

export type Inserts<TableName extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][TableName]["Insert"];

export type Updates<TableName extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][TableName]["Update"];
