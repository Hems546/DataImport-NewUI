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
      ad_manager_credentials: {
        Row: {
          access_token: string | null
          client_id: string | null
          client_secret: string | null
          created_at: string
          id: string
          network_code: string
          refresh_token: string | null
          token_expiry: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          client_id?: string | null
          client_secret?: string | null
          created_at?: string
          id?: string
          network_code: string
          refresh_token?: string | null
          token_expiry?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          client_id?: string | null
          client_secret?: string | null
          created_at?: string
          id?: string
          network_code?: string
          refresh_token?: string | null
          token_expiry?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ad_manager_reports: {
        Row: {
          created_at: string
          data: Json
          id: string
          network_code: string
          report_type: string
          time_range: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          network_code: string
          report_type: string
          time_range: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          network_code?: string
          report_type?: string
          time_range?: string
          user_id?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          id: string
          key_value: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_value: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          key_value?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      asset_stages: {
        Row: {
          created_at: string
          id: string
          name: string
          position: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          position: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          position?: number
          updated_at?: string
        }
        Relationships: []
      }
      asset_statuses: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      asset_types: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          arrival_date: string | null
          assigned_to: string | null
          content_type_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          file_size: number | null
          id: string
          metadata: Json | null
          name: string
          project_id: string | null
          stage_id: string | null
          status_id: string | null
          tags: string[] | null
          type_id: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          arrival_date?: string | null
          assigned_to?: string | null
          content_type_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          file_size?: number | null
          id?: string
          metadata?: Json | null
          name: string
          project_id?: string | null
          stage_id?: string | null
          status_id?: string | null
          tags?: string[] | null
          type_id?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          arrival_date?: string | null
          assigned_to?: string | null
          content_type_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          file_size?: number | null
          id?: string
          metadata?: Json | null
          name?: string
          project_id?: string | null
          stage_id?: string | null
          status_id?: string | null
          tags?: string[] | null
          type_id?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_content_type_id_fkey"
            columns: ["content_type_id"]
            isOneToOne: false
            referencedRelation: "content_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "asset_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "asset_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "asset_types"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          asset_id: string | null
          author_id: string
          content: string
          created_at: string
          id: string
          project_id: string | null
          task_id: string | null
          updated_at: string
        }
        Insert: {
          asset_id?: string | null
          author_id: string
          content: string
          created_at?: string
          id?: string
          project_id?: string | null
          task_id?: string | null
          updated_at?: string
        }
        Update: {
          asset_id?: string | null
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          project_id?: string | null
          task_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      content_prep_results: {
        Row: {
          asset_id: string | null
          corrected_text: string
          created_at: string
          headlines: Json | null
          id: string
          image_prompts: Json | null
          keywords: Json | null
          page_titles: Json | null
          pull_quotes: Json | null
          social_media: Json | null
          source_content: string
          subheadings: Json | null
          suggested_images: Json | null
          summaries: Json | null
          updated_at: string
        }
        Insert: {
          asset_id?: string | null
          corrected_text: string
          created_at?: string
          headlines?: Json | null
          id?: string
          image_prompts?: Json | null
          keywords?: Json | null
          page_titles?: Json | null
          pull_quotes?: Json | null
          social_media?: Json | null
          source_content: string
          subheadings?: Json | null
          suggested_images?: Json | null
          summaries?: Json | null
          updated_at?: string
        }
        Update: {
          asset_id?: string | null
          corrected_text?: string
          created_at?: string
          headlines?: Json | null
          id?: string
          image_prompts?: Json | null
          keywords?: Json | null
          page_titles?: Json | null
          pull_quotes?: Json | null
          social_media?: Json | null
          source_content?: string
          subheadings?: Json | null
          suggested_images?: Json | null
          summaries?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_prep_results_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      content_types: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      distribution_logs: {
        Row: {
          created_at: string
          id: string
          job_listing_id: string
          platforms: string[]
          scheduled_date: string
          settings: Json
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_listing_id: string
          platforms: string[]
          scheduled_date: string
          settings: Json
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          job_listing_id?: string
          platforms?: string[]
          scheduled_date?: string
          settings?: Json
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "distribution_logs_job_listing_id_fkey"
            columns: ["job_listing_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string
          created_at: string | null
          id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      file_validations: {
        Row: {
          created_at: string | null
          id: string
          import_session_id: string
          message: string | null
          metadata: Json | null
          severity: Database["public"]["Enums"]["validation_severity"] | null
          status: string
          validation_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          import_session_id: string
          message?: string | null
          metadata?: Json | null
          severity?: Database["public"]["Enums"]["validation_severity"] | null
          status: string
          validation_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          import_session_id?: string
          message?: string | null
          metadata?: Json | null
          severity?: Database["public"]["Enums"]["validation_severity"] | null
          status?: string
          validation_type?: string
        }
        Relationships: []
      }
      help_file_embeddings: {
        Row: {
          chunk_id: string
          created_at: string
          embedding: number[]
          file_id: string
          id: string
          metadata: Json | null
          text_chunk: string
          updated_at: string
        }
        Insert: {
          chunk_id: string
          created_at?: string
          embedding: number[]
          file_id: string
          id?: string
          metadata?: Json | null
          text_chunk: string
          updated_at?: string
        }
        Update: {
          chunk_id?: string
          created_at?: string
          embedding?: number[]
          file_id?: string
          id?: string
          metadata?: Json | null
          text_chunk?: string
          updated_at?: string
        }
        Relationships: []
      }
      import_executions: {
        Row: {
          completed_at: string | null
          error_log: Json | null
          failed_rows: number | null
          id: string
          import_session_id: string
          metadata: Json | null
          processed_rows: number | null
          started_at: string | null
          status: string
          total_rows: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          error_log?: Json | null
          failed_rows?: number | null
          id?: string
          import_session_id: string
          metadata?: Json | null
          processed_rows?: number | null
          started_at?: string | null
          status?: string
          total_rows: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          error_log?: Json | null
          failed_rows?: number | null
          id?: string
          import_session_id?: string
          metadata?: Json | null
          processed_rows?: number | null
          started_at?: string | null
          status?: string
          total_rows?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_executions_import_session_id_fkey"
            columns: ["import_session_id"]
            isOneToOne: false
            referencedRelation: "import_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      import_logs: {
        Row: {
          column_name: string | null
          created_at: string
          id: string
          import_session_id: string
          is_resolved: boolean | null
          log_type: string
          message: string
          original_value: string | null
          row_index: number
          suggested_value: string | null
          updated_at: string
        }
        Insert: {
          column_name?: string | null
          created_at?: string
          id?: string
          import_session_id: string
          is_resolved?: boolean | null
          log_type: string
          message: string
          original_value?: string | null
          row_index: number
          suggested_value?: string | null
          updated_at?: string
        }
        Update: {
          column_name?: string | null
          created_at?: string
          id?: string
          import_session_id?: string
          is_resolved?: boolean | null
          log_type?: string
          message?: string
          original_value?: string | null
          row_index?: number
          suggested_value?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_logs_import_session_id_fkey"
            columns: ["import_session_id"]
            isOneToOne: false
            referencedRelation: "import_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      import_sessions: {
        Row: {
          column_count: number | null
          created_at: string
          id: string
          mapping_config: Json | null
          original_filename: string
          row_count: number | null
          session_id: string
          source_columns: Json | null
          status: string
          target_table: string | null
          updated_at: string
          upload_time: string
          user_id: string | null
        }
        Insert: {
          column_count?: number | null
          created_at?: string
          id?: string
          mapping_config?: Json | null
          original_filename: string
          row_count?: number | null
          session_id: string
          source_columns?: Json | null
          status?: string
          target_table?: string | null
          updated_at?: string
          upload_time?: string
          user_id?: string | null
        }
        Update: {
          column_count?: number | null
          created_at?: string
          id?: string
          mapping_config?: Json | null
          original_filename?: string
          row_count?: number | null
          session_id?: string
          source_columns?: Json | null
          status?: string
          target_table?: string | null
          updated_at?: string
          upload_time?: string
          user_id?: string | null
        }
        Relationships: []
      }
      imported_data: {
        Row: {
          column_definitions: Json
          data: Json
          id: string
          import_session_id: string
          imported_at: string
          row_count: number
          source_filename: string | null
          user_id: string | null
        }
        Insert: {
          column_definitions: Json
          data: Json
          id?: string
          import_session_id: string
          imported_at?: string
          row_count: number
          source_filename?: string | null
          user_id?: string | null
        }
        Update: {
          column_definitions?: Json
          data?: Json
          id?: string
          import_session_id?: string
          imported_at?: string
          row_count?: number
          source_filename?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "imported_data_import_session_id_fkey"
            columns: ["import_session_id"]
            isOneToOne: false
            referencedRelation: "import_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          ai_score: number | null
          applicant_name: string
          cover_letter_text: string | null
          created_at: string
          email: string | null
          id: string
          job_listing_id: string
          notes: string | null
          phone: string | null
          resume_url: string | null
          stage: string | null
          status: Database["public"]["Enums"]["application_status"] | null
          updated_at: string
        }
        Insert: {
          ai_score?: number | null
          applicant_name: string
          cover_letter_text?: string | null
          created_at?: string
          email?: string | null
          id?: string
          job_listing_id: string
          notes?: string | null
          phone?: string | null
          resume_url?: string | null
          stage?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string
        }
        Update: {
          ai_score?: number | null
          applicant_name?: string
          cover_letter_text?: string | null
          created_at?: string
          email?: string | null
          id?: string
          job_listing_id?: string
          notes?: string | null
          phone?: string | null
          resume_url?: string | null
          stage?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_listing_id_fkey"
            columns: ["job_listing_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_listings: {
        Row: {
          application_url: string | null
          benefits: string | null
          company: string
          created_at: string
          description: string | null
          external_id: string | null
          id: string
          location: string | null
          posted_date: string | null
          requirements: string | null
          salary_range: string | null
          source: string
          title: string
          updated_at: string
        }
        Insert: {
          application_url?: string | null
          benefits?: string | null
          company: string
          created_at?: string
          description?: string | null
          external_id?: string | null
          id?: string
          location?: string | null
          posted_date?: string | null
          requirements?: string | null
          salary_range?: string | null
          source: string
          title: string
          updated_at?: string
        }
        Update: {
          application_url?: string | null
          benefits?: string | null
          company?: string
          created_at?: string
          description?: string | null
          external_id?: string | null
          id?: string
          location?: string | null
          posted_date?: string | null
          requirements?: string | null
          salary_range?: string | null
          source?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      listing_images: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          listing_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          listing_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          listing_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_images_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          featured_until: string | null
          id: string
          is_featured: boolean | null
          location: string | null
          price: number
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          featured_until?: string | null
          id?: string
          is_featured?: boolean | null
          location?: string | null
          price: number
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          featured_until?: string | null
          id?: string
          is_featured?: boolean | null
          location?: string | null
          price?: number
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      login_history: {
        Row: {
          device_info: Json | null
          failure_reason: string | null
          id: string
          ip_address: string | null
          location_info: Json | null
          login_timestamp: string | null
          success: boolean | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          device_info?: Json | null
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          location_info?: Json | null
          login_timestamp?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          device_info?: Json | null
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          location_info?: Json | null
          login_timestamp?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      milestones: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string
          id: string
          project_id: string
          related_tasks: string[] | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          project_id: string
          related_tasks?: string[] | null
          status: string
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          project_id?: string
          related_tasks?: string[] | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean
          related_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean
          related_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          related_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      press_releases: {
        Row: {
          company_name: string | null
          created_at: string
          date_received: string
          first_name: string | null
          id: string
          images: Json | null
          last_name: string | null
          original_text: string
          rewritten_content: string | null
          source: string
          status: string
          title: string
          tone: string | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          date_received?: string
          first_name?: string | null
          id?: string
          images?: Json | null
          last_name?: string | null
          original_text: string
          rewritten_content?: string | null
          source: string
          status: string
          title: string
          tone?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          date_received?: string
          first_name?: string | null
          id?: string
          images?: Json | null
          last_name?: string | null
          original_text?: string
          rewritten_content?: string | null
          source?: string
          status?: string
          title?: string
          tone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_stages: {
        Row: {
          created_at: string
          id: string
          name: string
          position: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          position: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          position?: number
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          actual_cost: number | null
          budget: number | null
          client_name: string | null
          completed_date: string | null
          created_at: string
          creative_brief: string | null
          description: string | null
          due_date: string | null
          goals: string | null
          id: string
          name: string
          notes: string | null
          owner: string
          priority: string | null
          progress: number
          project_code: string | null
          project_type: string | null
          start_date: string
          status: string
          tags: string[] | null
          team: string[] | null
          updated_at: string
        }
        Insert: {
          actual_cost?: number | null
          budget?: number | null
          client_name?: string | null
          completed_date?: string | null
          created_at?: string
          creative_brief?: string | null
          description?: string | null
          due_date?: string | null
          goals?: string | null
          id?: string
          name: string
          notes?: string | null
          owner: string
          priority?: string | null
          progress?: number
          project_code?: string | null
          project_type?: string | null
          start_date: string
          status: string
          tags?: string[] | null
          team?: string[] | null
          updated_at?: string
        }
        Update: {
          actual_cost?: number | null
          budget?: number | null
          client_name?: string | null
          completed_date?: string | null
          created_at?: string
          creative_brief?: string | null
          description?: string | null
          due_date?: string | null
          goals?: string | null
          id?: string
          name?: string
          notes?: string | null
          owner?: string
          priority?: string | null
          progress?: number
          project_code?: string | null
          project_type?: string | null
          start_date?: string
          status?: string
          tags?: string[] | null
          team?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      subtasks: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          task_id: string
          title: string
          updated_at: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          task_id: string
          title: string
          updated_at?: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          task_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subtasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_hours: number | null
          asset_id: string | null
          assigned_to: string | null
          assignees: string[] | null
          attachments: string[] | null
          completed_at: string | null
          created_at: string
          dependencies: string[] | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          labels: string[] | null
          priority: string
          project_id: string
          start_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          asset_id?: string | null
          assigned_to?: string | null
          assignees?: string[] | null
          attachments?: string[] | null
          completed_at?: string | null
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          labels?: string[] | null
          priority: string
          project_id: string
          start_date?: string | null
          status: string
          title: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          asset_id?: string | null
          assigned_to?: string | null
          assignees?: string[] | null
          attachments?: string[] | null
          completed_at?: string | null
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          labels?: string[] | null
          priority?: string
          project_id?: string
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          billable: boolean
          created_at: string
          description: string | null
          duration: number | null
          end_time: string | null
          id: string
          project_id: string
          start_time: string
          task_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billable?: boolean
          created_at?: string
          description?: string | null
          duration?: number | null
          end_time?: string | null
          id?: string
          project_id: string
          start_time: string
          task_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billable?: boolean
          created_at?: string
          description?: string | null
          duration?: number | null
          end_time?: string | null
          id?: string
          project_id?: string
          start_time?: string
          task_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_security_settings: {
        Row: {
          backup_codes: Json | null
          created_at: string | null
          failed_login_attempts: number | null
          id: string
          last_failed_login: string | null
          locked_until: string | null
          mfa_enabled: boolean | null
          mfa_secret: string | null
          mfa_verified: boolean | null
          password_last_changed: string | null
          updated_at: string | null
        }
        Insert: {
          backup_codes?: Json | null
          created_at?: string | null
          failed_login_attempts?: number | null
          id: string
          last_failed_login?: string | null
          locked_until?: string | null
          mfa_enabled?: boolean | null
          mfa_secret?: string | null
          mfa_verified?: boolean | null
          password_last_changed?: string | null
          updated_at?: string | null
        }
        Update: {
          backup_codes?: Json | null
          created_at?: string | null
          failed_login_attempts?: number | null
          id?: string
          last_failed_login?: string | null
          locked_until?: string | null
          mfa_enabled?: boolean | null
          mfa_secret?: string | null
          mfa_verified?: boolean | null
          password_last_changed?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          expires_at: string
          id: string
          ip_address: string | null
          last_active: string | null
          session_token: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          expires_at: string
          id?: string
          ip_address?: string | null
          last_active?: string | null
          session_token: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          last_active?: string | null
          session_token?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_password_strength: {
        Args: { password: string }
        Returns: boolean
      }
      has_permission: {
        Args: { _user_id: string; _permission: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      validate_file_headers: {
        Args: { p_headers: string[]; p_import_session_id: string }
        Returns: undefined
      }
    }
    Enums: {
      application_status:
        | "Applied"
        | "Interview"
        | "Assessment"
        | "Offer"
        | "Rejected"
      user_role: "admin" | "editor" | "viewer" | "contributor"
      validation_severity: "critical" | "warning"
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
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
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
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
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
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      application_status: [
        "Applied",
        "Interview",
        "Assessment",
        "Offer",
        "Rejected",
      ],
      user_role: ["admin", "editor", "viewer", "contributor"],
      validation_severity: ["critical", "warning"],
    },
  },
} as const
