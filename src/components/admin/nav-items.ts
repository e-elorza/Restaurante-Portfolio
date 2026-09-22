export type AdminNavItem = {
  href: string;
  label: string;
  /** Descrição curta em linguagem simples, usada como tooltip e no dashboard. */
  description: string;
  icon: string;
  exact?: boolean;
  /** Só aparece para quem tem acesso de administrador. */
  adminOnly?: boolean;
};

export type AdminNavGroup = {
  title: string;
  items: AdminNavItem[];
};

/**
 * Menu do painel. Os nomes são propositalmente simples — quem usa é o gerente
 * do restaurante, não um desenvolvedor.
 */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    title: "Visão geral",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        description: "Resumo do cardápio e das últimas alterações.",
        icon: "LayoutDashboard",
        exact: true,
      },
    ],
  },
  {
    title: "Cardápio",
    items: [
      {
        href: "/admin/produtos",
        label: "Produtos",
        description: "Cadastre pratos, preços, fotos e disponibilidade.",
        icon: "UtensilsCrossed",
      },
      {
        href: "/admin/categorias",
        label: "Categorias",
        description: "Organize o cardápio em seções (Burgers, Bebidas...).",
        icon: "FolderTree",
      },
    ],
  },
  {
    title: "Site",
    items: [
      {
        href: "/admin/home",
        label: "Página inicial",
        description: "Escolha e organize as seções da primeira página.",
        icon: "Home",
      },
      {
        href: "/admin/paginas",
        label: "Páginas",
        description: "Ligue ou desligue páginas e edite seus textos.",
        icon: "Files",
      },
      {
        href: "/admin/delivery",
        label: "Delivery",
        description: "Canais em que o cliente pode fazer o pedido.",
        icon: "Bike",
      },
      {
        href: "/admin/eventos",
        label: "Eventos",
        description: "Agenda de eventos do restaurante.",
        icon: "CalendarDays",
      },
      {
        href: "/admin/unidades",
        label: "Unidades",
        description: "Endereços, horários e contatos de cada loja.",
        icon: "MapPin",
      },
    ],
  },
  {
    title: "Identidade",
    items: [
      {
        href: "/admin/midia",
        label: "Mídia",
        description: "Todas as imagens do site em um só lugar.",
        icon: "Images",
      },
      {
        href: "/admin/aparencia",
        label: "Aparência",
        description: "Cores, fontes e formato dos botões e cards.",
        icon: "Palette",
      },
      {
        href: "/admin/seo",
        label: "SEO",
        description: "Como o site aparece no Google e no WhatsApp.",
        icon: "Search",
      },
      {
        href: "/admin/redes-sociais",
        label: "Redes sociais",
        description: "Instagram, TikTok, Facebook e outras redes.",
        icon: "Share2",
      },
    ],
  },
  {
    title: "Sistema",
    items: [
      {
        href: "/admin/configuracoes",
        label: "Configurações",
        description: "Nome, contatos, WhatsApp e dados gerais.",
        icon: "Settings",
      },
      {
        href: "/admin/usuarios",
        label: "Usuários",
        description: "Crie acessos ao painel para outras pessoas da equipe.",
        icon: "Users",
        adminOnly: true,
      },
      {
        href: "/admin/conta",
        label: "Minha conta",
        description: "Trocar a senha de acesso ao painel.",
        icon: "UserRound",
      },
    ],
  },
];
