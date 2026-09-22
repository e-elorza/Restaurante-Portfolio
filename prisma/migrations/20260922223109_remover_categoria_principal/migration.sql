-- A escolha da categoria exibida saiu da própria categoria e passou para a
-- configuração da seção "Cardápio simples" da página inicial, onde ela é
-- usada. A coluna deixa de existir.
ALTER TABLE "categories" DROP COLUMN "isPrimary";
