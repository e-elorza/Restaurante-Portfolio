-- O rodapé tinha cópias próprias de endereço e telefone, que venciam as de
-- Configurações. Quem corrigia o telefone em Configurações não via mudança
-- nenhuma no rodapé. Agora o rodapé usa o telefone e o endereço do
-- restaurante, que é o que a página de Contato já usava.

-- Se Configurações estiver vazio, aproveita o que estava só no rodapé.
UPDATE "restaurant_settings" r SET "address" = (
  SELECT NULLIF(f."address", '') FROM "footer_settings" f LIMIT 1
) WHERE NULLIF(r."address", '') IS NULL;

UPDATE "restaurant_settings" r SET "phone" = (
  SELECT NULLIF(f."phone", '') FROM "footer_settings" f LIMIT 1
) WHERE NULLIF(r."phone", '') IS NULL;

ALTER TABLE "footer_settings" DROP COLUMN "address";
ALTER TABLE "footer_settings" DROP COLUMN "phone";
