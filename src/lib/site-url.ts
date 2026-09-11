/**
 * Endereço público do site, usado em metadados, OpenGraph e sitemap.
 *
 * A ordem de preferência permite que o primeiro deploy na Vercel já funcione
 * sem nenhuma configuração extra:
 *
 * 1. `NEXT_PUBLIC_SITE_URL` — o domínio final, definido pelo dono do site;
 * 2. `VERCEL_PROJECT_PRODUCTION_URL` — o domínio de produção do projeto;
 * 3. `VERCEL_URL` — o endereço daquele deploy específico (preview);
 * 4. `http://localhost:3000` — desenvolvimento.
 */
export function siteUrl(): string {
  const candidatos = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ];

  for (const candidato of candidatos) {
    const valor = candidato?.trim();
    if (!valor) continue;
    const comProtocolo = /^https?:\/\//i.test(valor) ? valor : `https://${valor}`;
    return comProtocolo.replace(/\/+$/, "");
  }

  return "http://localhost:3000";
}
