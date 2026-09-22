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
  /** Sem título, o grupo aparece sem cabeçalho — usado pelo item solto do topo. */
  title?: string;
  items: AdminNavItem[];
};

/**
 * Menu do painel. Os nomes são propositalmente simples — quem usa é o gerente
 * do restaurante, não um desenvolvedor.
 */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    items: [
      {
        href: "/admin",
        label: "Início",
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
        description: "Seus pratos: preço, foto, descrição e se está esgotado.",
        icon: "UtensilsCrossed",
      },
      {
        href: "/admin/categorias",
        label: "Categorias",
        description: "As seções do cardápio: Hambúrgueres, Bebidas, Sobremesas...",
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
        description: "Monte a primeira página que o cliente vê.",
        icon: "Home",
      },
      {
        href: "/admin/paginas",
        label: "Páginas",
        description: "Ligue ou desligue páginas do site e edite seus textos.",
        icon: "Files",
      },
      {
        href: "/admin/delivery",
        label: "Delivery",
        description: "Por onde o cliente faz o pedido: WhatsApp, apps, retirada.",
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
        description: "Endereço, horário e telefone de cada loja.",
        icon: "MapPin",
      },
    ],
  },
  {
    title: "Aparência",
    items: [
      {
        href: "/admin/midia",
        label: "Imagens",
        description: "Logo, ícone e as capas das páginas, num lugar só.",
        icon: "Images",
      },
      {
        href: "/admin/aparencia",
        label: "Cores e fontes",
        description: "A cara do site: cores, fontes, cabeçalho e rodapé.",
        icon: "Palette",
      },
      {
        href: "/admin/seo",
        label: "Google e buscadores",
        description: "Como o site aparece na busca do Google.",
        icon: "Search",
      },
      {
        href: "/admin/redes-sociais",
        label: "Redes sociais",
        description: "Os links do Instagram, TikTok e outras redes.",
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
        description: "Nome do restaurante, telefone, WhatsApp e endereço.",
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
