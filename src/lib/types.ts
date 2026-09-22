import type {
  Category,
  DeliveryOption,
  Event,
  HomeSection,
  Location,
  Page,
  Product,
  ProductImage,
  SocialLink,
} from "@prisma/client";

/** Produto pronto para o site público (Decimal já convertido para número). */
export type PublicProduct = Omit<Product, "price" | "promoPrice" | "nutrition"> & {
  price: number;
  promoPrice: number | null;
  nutrition: NutritionInfo | null;
  images: ProductImage[];
  category: Pick<Category, "id" | "name" | "slug"> | null;
};

export type NutritionInfo = {
  calories?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
  notes?: string;
};

export type PublicCategory = Category & {
  products: PublicProduct[];
};

export type SectionAlign = "LEFT" | "CENTER" | "RIGHT";
export type SectionHeightValue = "COMPACT" | "MEDIUM" | "TALL" | "FULLSCREEN";
export type VideoProviderValue = "UPLOAD" | "YOUTUBE" | "VIMEO";

export type HeroSlide = {
  imageUrl: string;
  imageMobileUrl?: string;
  alt?: string;
  title?: string;
  subtitle?: string;
};

export type HeroConfig = {
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL";
  imageUrl: string;
  imageMobileUrl: string;
  imageAlt: string;
  slides: HeroSlide[];
  videoProvider: VideoProviderValue;
  videoUrl: string;
  posterUrl: string;
  buttonEnabled: boolean;
  buttonLabel: string;
  buttonUrl: string;
  align: SectionAlign;
  overlay: number;
  height: SectionHeightValue;
};

export type VideoConfig = {
  provider: VideoProviderValue;
  url: string;
  posterUrl: string;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  controls: boolean;
  fullWidth: boolean;
};

/**
 * Como a seção do cardápio aparece na página inicial:
 *  - CARDS: vitrine com a foto de cada categoria;
 *  - SIMPLE: lista de preços da categoria marcada como principal, no estilo
 *    de um cardápio impresso (nome, linha de condução e preço).
 */
export type CategoriesLayout = "CARDS" | "SIMPLE";

export type CategoriesConfig = {
  layout: CategoriesLayout;
  limit: number;
  showDescription: boolean;
  buttonLabel: string;
};

export type FeaturedProductsConfig = {
  source: "FEATURED" | "BEST_SELLER" | "NEW" | "CATEGORY";
  categoryId: string;
  limit: number;
  buttonLabel: string;
  buttonUrl: string;
};

export type BannerConfig = {
  imageUrl: string;
  imageMobileUrl: string;
  imageAlt: string;
  buttonLabel: string;
  buttonUrl: string;
  overlay: number;
  align: SectionAlign;
  height: SectionHeightValue;
};

export type AboutConfig = {
  imageUrl: string;
  imageAlt: string;
  text: string;
  imagePosition: "LEFT" | "RIGHT";
  buttonLabel: string;
  buttonUrl: string;
};

export type GalleryImage = { url: string; alt?: string };

export type GalleryConfig = {
  images: GalleryImage[];
  columns: number;
};

export type DeliveryCtaConfig = {
  text: string;
  buttonLabel: string;
  buttonUrl: string;
  imageUrl: string;
  imageAlt: string;
};

export type LocationsConfig = {
  limit: number;
  buttonLabel: string;
};

export type SocialConfig = {
  handle: string;
  text: string;
  images: GalleryImage[];
};

export type HomeSectionConfigMap = {
  HERO: HeroConfig;
  VIDEO: VideoConfig;
  CATEGORIES: CategoriesConfig;
  FEATURED_PRODUCTS: FeaturedProductsConfig;
  BANNER: BannerConfig;
  ABOUT: AboutConfig;
  GALLERY: GalleryConfig;
  DELIVERY_CTA: DeliveryCtaConfig;
  LOCATIONS: LocationsConfig;
  SOCIAL: SocialConfig;
};

export type HomeSectionType = keyof HomeSectionConfigMap;

export type TypedHomeSection<T extends HomeSectionType = HomeSectionType> =
  Omit<HomeSection, "type" | "config"> & {
    type: T;
    config: HomeSectionConfigMap[T];
  };

export type NavigationItem = {
  key: Page["key"];
  label: string;
  path: string;
};

export type SiteChrome = {
  pages: NavigationItem[];
  footerPages: NavigationItem[];
  socials: SocialLink[];
};

export type PublicDeliveryOption = DeliveryOption;
export type PublicEvent = Event;
export type PublicLocation = Location;

/** Resultado padronizado das Server Actions do painel. */
export type ActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string[]>;
};

export const IDLE_ACTION_STATE: ActionState = { status: "idle", message: "" };
