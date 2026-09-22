-- Cada imagem da marca tinha até três lugares para ser configurada, com uma
-- ordem de precedência invisível: quem trocava a logo em Configurações não via
-- nada mudar porque Aparência tinha a dela. Agora Mídia é o único lugar.
--
-- Primeiro trazemos para Mídia o que já estava configurado, respeitando a
-- mesma precedência que o site usava, para nenhuma imagem se perder.

-- Logo do cabeçalho: Aparência > Mídia > Configurações
UPDATE "media_slots" m SET "url" = COALESCE(
  (SELECT NULLIF(h."logoUrl", '') FROM "header_settings" h LIMIT 1),
  NULLIF(m."url", ''),
  (SELECT NULLIF(r."logoUrl", '') FROM "restaurant_settings" r LIMIT 1)
) WHERE m."key" = 'logo-principal';

-- Logo do rodapé: Aparência > Mídia
UPDATE "media_slots" m SET "url" = COALESCE(
  (SELECT NULLIF(f."logoUrl", '') FROM "footer_settings" f LIMIT 1),
  NULLIF(m."url", '')
) WHERE m."key" = 'logo-rodape';

-- Ícone do navegador: SEO (o único que o site lia) > Configurações
UPDATE "media_slots" m SET "url" = COALESCE(
  (SELECT NULLIF(s."faviconUrl", '') FROM "seo_settings" s LIMIT 1),
  (SELECT NULLIF(r."faviconUrl", '') FROM "restaurant_settings" r LIMIT 1),
  NULLIF(m."url", '')
) WHERE m."key" = 'favicon';

-- Imagem de compartilhamento: vinha de SEO
UPDATE "media_slots" m SET "url" = COALESCE(
  (SELECT NULLIF(s."ogImageUrl", '') FROM "seo_settings" s LIMIT 1),
  NULLIF(m."url", '')
) WHERE m."key" = 'imagem-compartilhamento';

-- As imagens das seções da página inicial são configuradas em cada seção.
-- Estes espaços em Mídia nunca foram lidos pelo site: o dono preenchia e nada
-- acontecia. Somem, para sobrar só o que tem efeito.
DELETE FROM "media_slots" WHERE "key" IN (
  'home-destaque',
  'home-destaque-celular',
  'home-sobre',
  'home-banner',
  'home-video-capa'
);

-- Com os valores salvos, as colunas duplicadas deixam de existir.
ALTER TABLE "header_settings" DROP COLUMN "logoUrl";
ALTER TABLE "footer_settings" DROP COLUMN "logoUrl";
ALTER TABLE "restaurant_settings" DROP COLUMN "logoUrl";
ALTER TABLE "restaurant_settings" DROP COLUMN "faviconUrl";
ALTER TABLE "seo_settings" DROP COLUMN "faviconUrl";
ALTER TABLE "seo_settings" DROP COLUMN "ogImageUrl";
