export const brand = {
  name: "SensConverter",
  tagline: "Una sensibilidad. Todos tus juegos.",
  description:
    "Convierte la sensibilidad del ratón entre juegos con fórmulas verificadas, cm/360 y una referencia física global.",
  version: "0.1.0",
} as const;

export const siteUrl = "https://sensicore-zeta.vercel.app";

/**
 * Donation page (Ko-fi). Leave null to hide every donation link; set it to the
 * full page URL, e.g. "https://ko-fi.com/usuario", to show them.
 */
export const donation: { provider: string; url: string | null } = {
  provider: "Ko-fi",
  url: "https://ko-fi.com/alejandroprietodiez",
};
