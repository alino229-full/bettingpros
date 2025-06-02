export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          currency?: string
          created_at?: string
          updated_at?: string
        }
      }
      bets: {
        Row: {
          id: string
          user_id: string
          match_name: string
          sport: string
          competition: string | null
          bet_type: "simple" | "combine" | "systeme"
          prediction: string
          odds: number
          stake: number
          potential_win: number | null
          actual_win: number | null
          match_date: string | null
          match_time: string | null
          bookmaker: string | null
          ticket_id: string | null
          status: "pending" | "won" | "lost" | "cancelled"
          confidence_score: number | null
          is_ocr_extracted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          match_name: string
          sport: string
          competition?: string | null
          bet_type: "simple" | "combine" | "systeme"
          prediction: string
          odds: number
          stake: number
          potential_win?: number | null
          actual_win?: number | null
          match_date?: string | null
          match_time?: string | null
          bookmaker?: string | null
          ticket_id?: string | null
          status?: "pending" | "won" | "lost" | "cancelled"
          confidence_score?: number | null
          is_ocr_extracted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          match_name?: string
          sport?: string
          competition?: string | null
          bet_type?: "simple" | "combine" | "systeme"
          prediction?: string
          odds?: number
          stake?: number
          potential_win?: number | null
          actual_win?: number | null
          match_date?: string | null
          match_time?: string | null
          bookmaker?: string | null
          ticket_id?: string | null
          status?: "pending" | "won" | "lost" | "cancelled"
          confidence_score?: number | null
          is_ocr_extracted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Bet = Database["public"]["Tables"]["bets"]["Row"]
export type InsertBet = Database["public"]["Tables"]["bets"]["Insert"]
export type UpdateBet = Database["public"]["Tables"]["bets"]["Update"]
