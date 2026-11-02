export interface ProfileRow {
  id: string;
  display_name: string | null;
  default_dpi: number | null;
  global_cm360: number | null;
  created_at: string;
  updated_at: string;
}

export interface SensitivityProfileRow {
  id: string;
  user_id: string;
  name: string;
  game_id: string;
  dpi: number;
  sensitivity: number;
  fov: number | null;
  method: string;
  cm360: number | null;
  notes: string | null;
  is_favorite: boolean;
  is_preferred: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActionResult {
  ok: boolean;
  message: string;
}
