import type { RestaurantSettings } from "@prisma/client";

import type { PublicProduct } from "@/lib/types";
import { safeExternalUrl, whatsappLink } from "@/lib/utils";

/**
 * Descobre para onde o botão "Pedir agora" deve levar, nesta ordem:
 * 1. link próprio do produto;
 * 2. link geral de pedidos configurado em Admin > Configurações;
 * 3. WhatsApp com o nome do produto já na mensagem;
 * 4. página de delivery do site.
 */
export function resolveOrderLink(
  product: Pick<PublicProduct, "name" | "orderUrl">,
  settings: RestaurantSettings,
  deliveryEnabled: boolean,
): string {
  if (product.orderUrl) return safeExternalUrl(product.orderUrl);
  if (settings.orderUrl) return safeExternalUrl(settings.orderUrl);

  if (settings.whatsapp) {
    const message = `Olá! Vim pelo cardápio e gostaria de pedir: ${product.name}.`;
    const link = whatsappLink(settings.whatsapp, message);
    if (link) return link;
  }

  return deliveryEnabled ? "/delivery" : "";
}

/** Link genérico de pedido (sem produto específico). */
export function resolveGeneralOrderLink(
  settings: RestaurantSettings,
  deliveryEnabled: boolean,
): string {
  if (settings.orderUrl) return safeExternalUrl(settings.orderUrl);
  const link = whatsappLink(settings.whatsapp, settings.whatsappMessage);
  if (link) return link;
  return deliveryEnabled ? "/delivery" : "";
}
