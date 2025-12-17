// Supabase のテーブル型定義
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'manager' | 'staff'
          department: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'manager' | 'staff'
          department?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'manager' | 'staff'
          department?: string | null
          updated_at?: string
        }
      }
      call_records: {
        Row: {
          id: string
          lead_id: string
          lead_source: string
          linked_date: string | null
          industry: string | null
          company_name: string
          contact_name: string
          contact_name_kana: string | null
          phone: string
          email: string | null
          address: string | null
          opening_date: string | null
          contact_preferred_datetime: string | null
          alliance_remarks: string | null
          omc_additional_info1: string | null
          omc_self_funds: string | null
          omc_property_status: string | null
          amazon_tax_accountant: string | null
          meetsmore_link: string | null
          meetsmore_entity_type: string | null
          makuake_pjt_page: string | null
          makuake_executor_page: string | null
          status: string
          staff_is: string | null
          status_is: string | null
          status_update_date: string | null
          cannot_contact_reason: string | null
          recycle_priority: string | null
          result_contact_status: string | null
          last_called_date: string | null
          call_count: number
          call_duration: string | null
          conversation_memo: string | null
          action_outside_call: string | null
          next_action_date: string | null
          next_action_content: string | null
          next_action_supplement: string | null
          next_action_completed: string | null
          appointment_date: string | null
          deal_setup_date: string | null
          deal_time: string | null
          deal_staff_fs: string | null
          deal_result: string | null
          lost_reason_fs: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          lead_source: string
          linked_date?: string | null
          industry?: string | null
          company_name: string
          contact_name: string
          contact_name_kana?: string | null
          phone: string
          email?: string | null
          address?: string | null
          opening_date?: string | null
          contact_preferred_datetime?: string | null
          alliance_remarks?: string | null
          omc_additional_info1?: string | null
          omc_self_funds?: string | null
          omc_property_status?: string | null
          amazon_tax_accountant?: string | null
          meetsmore_link?: string | null
          meetsmore_entity_type?: string | null
          makuake_pjt_page?: string | null
          makuake_executor_page?: string | null
          status?: string
          staff_is?: string | null
          status_is?: string | null
          status_update_date?: string | null
          cannot_contact_reason?: string | null
          recycle_priority?: string | null
          result_contact_status?: string | null
          last_called_date?: string | null
          call_count?: number
          call_duration?: string | null
          conversation_memo?: string | null
          action_outside_call?: string | null
          next_action_date?: string | null
          next_action_content?: string | null
          next_action_supplement?: string | null
          next_action_completed?: string | null
          appointment_date?: string | null
          deal_setup_date?: string | null
          deal_time?: string | null
          deal_staff_fs?: string | null
          deal_result?: string | null
          lost_reason_fs?: string | null
        }
        Update: {
          lead_id?: string
          lead_source?: string
          linked_date?: string | null
          industry?: string | null
          company_name?: string
          contact_name?: string
          contact_name_kana?: string | null
          phone?: string
          email?: string | null
          address?: string | null
          opening_date?: string | null
          contact_preferred_datetime?: string | null
          alliance_remarks?: string | null
          status?: string
          staff_is?: string | null
          status_is?: string | null
          last_called_date?: string | null
          call_count?: number
          call_duration?: string | null
          conversation_memo?: string | null
          next_action_date?: string | null
          next_action_content?: string | null
          appointment_date?: string | null
          deal_setup_date?: string | null
          deal_time?: string | null
          deal_staff_fs?: string | null
          deal_result?: string | null
        }
      }
      call_history: {
        Row: {
          id: string
          call_record_id: string
          call_date: string
          call_time: string | null
          staff_is: string
          status: string
          result: string | null
          duration: number | null
          memo: string | null
          created_at: string
        }
        Insert: {
          id?: string
          call_record_id: string
          call_date: string
          call_time?: string | null
          staff_is: string
          status: string
          result?: string | null
          duration?: number | null
          memo?: string | null
        }
        Update: {
          call_record_id?: string
          call_date?: string
          call_time?: string | null
          staff_is?: string
          status?: string
          result?: string | null
          duration?: number | null
          memo?: string | null
        }
      }
      deals: {
        Row: {
          id: string
          deal_id: string
          lead_id: string | null
          lead_source: string | null
          linked_date: string | null
          industry: string | null
          company_name: string
          contact_name: string
          contact_name_kana: string | null
          phone: string
          email: string | null
          address: string | null
          opening_date: string | null
          contact_preferred_datetime: string | null
          alliance_remarks: string | null
          omc_additional_info1: string | null
          omc_self_funds: string | null
          omc_property_status: string | null
          amazon_tax_accountant: string | null
          meetsmore_link: string | null
          makuake_link: string | null
          conversation_memo: string | null
          service: string | null
          category: string | null
          staff_is: string | null
          appointment_date: string | null
          deal_setup_date: string | null
          deal_time: string | null
          deal_staff_fs: string | null
          deal_execution_date: string | null
          video_link: string | null
          deal_phase: string | null
          phase_update_date: string | null
          rank_estimate: string | null
          rank_change: string | null
          rank_update_date: string | null
          last_contact_date: string | null
          action_scheduled_date: string | null
          next_action_content: string | null
          response_deadline: string | null
          action_completed: string | null
          customer_bant_info: string | null
          competitor_info: string | null
          deal_memo: string | null
          rank: string | null
          detail_rank: string | null
          result: string | null
          result_date: string | null
          lost_factor: string | null
          lost_reason: string | null
          lost_after_action: string | null
          feedback_to_is: string | null
          feedback: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          lead_id?: string | null
          lead_source?: string | null
          linked_date?: string | null
          industry?: string | null
          company_name: string
          contact_name: string
          contact_name_kana?: string | null
          phone: string
          email?: string | null
          service?: string | null
          category?: string | null
          staff_is?: string | null
          rank?: string | null
          result?: string | null
        }
        Update: {
          deal_id?: string
          lead_id?: string | null
          company_name?: string
          contact_name?: string
          phone?: string
          service?: string | null
          category?: string | null
          staff_is?: string | null
          rank?: string | null
          result?: string | null
          result_date?: string | null
          deal_phase?: string | null
          deal_memo?: string | null
        }
      }
      dropdown_settings: {
        Row: {
          id: string
          category: string
          key: string
          options: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category: string
          key: string
          options?: any
        }
        Update: {
          category?: string
          key?: string
          options?: any
        }
      }
    }
    Views: {
      contracts: {
        Row: {
          id: string
          deal_id: string
          contract_id: string
          company_name: string
          contact_name: string
          result: string
          result_date: string | null
        }
      }
    }
  }
}







