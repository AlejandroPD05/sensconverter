import { z } from "zod";

export const conversionMethodSchema = z.enum([
  "cm360",
  "fov-aware",
  "monitor-distance",
  "game-specific",
]);

export const saveCalculatorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El perfil necesita un nombre.")
    .max(80, "El nombre no puede superar 80 caracteres."),
  gameId: z.string().trim().min(1, "Selecciona un juego.").max(60),
  dpi: z
    .number()
    .finite("El DPI no es válido.")
    .min(1, "El DPI debe ser mayor que cero.")
    .max(32000, "El DPI máximo admitido es 32000."),
  sensitivity: z
    .number()
    .finite("La sensibilidad no es válida.")
    .positive("La sensibilidad debe ser mayor que cero."),
  method: conversionMethodSchema,
  fov: z.number().finite().min(1).max(179).optional(),
  cm360: z.number().finite().positive().optional(),
  notes: z.string().trim().max(500, "Las notas no pueden superar 500 caracteres.").optional(),
});

export const updateProfileSchema = z.object({
  id: z.string().uuid("Perfil no válido."),
  name: z.string().trim().min(1).max(80).optional(),
  dpi: z.number().finite().min(1).max(32000).optional(),
  sensitivity: z.number().finite().positive().optional(),
  notes: z.string().trim().max(500).optional(),
  isFavorite: z.boolean().optional(),
});

export const globalPreferenceSchema = z.object({
  cm360: z
    .number()
    .finite("El cm/360 no es válido.")
    .min(1, "El cm/360 debe ser al menos 1 cm.")
    .max(200, "El cm/360 máximo admitido es 200 cm."),
  dpi: z
    .number()
    .finite("El DPI no es válido.")
    .min(1, "El DPI debe ser mayor que cero.")
    .max(32000, "El DPI máximo admitido es 32000."),
});

export const accountSettingsSchema = z.object({
  displayName: z.string().trim().max(60, "El nombre no puede superar 60 caracteres."),
  defaultDpi: z
    .number()
    .finite()
    .min(1, "El DPI debe ser mayor que cero.")
    .max(32000, "El DPI máximo admitido es 32000."),
  globalCm360: z
    .number()
    .finite()
    .min(1, "El cm/360 debe ser al menos 1 cm.")
    .max(200, "El cm/360 máximo admitido es 200 cm."),
});

export const idSchema = z.string().uuid("Identificador no válido.");
