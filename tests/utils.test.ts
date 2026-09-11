import { describe, expect, it } from "vitest";
import type { RestaurantSettings } from "@prisma/client";

import {
  formatCurrency,
  onlyDigits,
  safeExternalUrl,
  slugify,
  splitList,
  truncate,
  whatsappLink,
} from "@/lib/utils";
import { hexToRgbChannels, readableTextColor, themeStyleSheet } from "@/lib/theme";
import { embedUrl, parseVideoSource } from "@/lib/video";
import { resolveGeneralOrderLink, resolveOrderLink } from "@/lib/order";
import { DEFAULT_APPEARANCE, DEFAULT_RESTAURANT } from "@/lib/data/defaults";

describe("slugify", () => {
  it("remove acentos e espaços", () => {
    expect(slugify("Hambúrguer Artesanal")).toBe("hamburguer-artesanal");
    expect(slugify("  Combo  da  Semana  ")).toBe("combo-da-semana");
  });

  it("remove caracteres especiais", () => {
    expect(slugify("Batata & Cheddar!")).toBe("batata-cheddar");
  });

  it("não deixa hífen sobrando nas pontas", () => {
    expect(slugify("--teste--")).toBe("teste");
  });
});

describe("formatCurrency", () => {
  it("formata em real brasileiro", () => {
    expect(formatCurrency(38.9, "BRL", "pt-BR").replace(/ /g, " ")).toBe("R$ 38,90");
  });

  it("aceita texto numérico", () => {
    expect(formatCurrency("12.5", "BRL", "pt-BR").replace(/ /g, " ")).toBe("R$ 12,50");
  });

  it("devolve vazio para valores inválidos", () => {
    expect(formatCurrency(null)).toBe("");
    expect(formatCurrency(undefined)).toBe("");
    expect(formatCurrency("abc")).toBe("");
  });
});

describe("textos auxiliares", () => {
  it("onlyDigits mantém apenas números", () => {
    expect(onlyDigits("(11) 99999-0000")).toBe("11999990000");
  });

  it("splitList aceita vírgulas e quebras de linha", () => {
    expect(splitList("a, b\nc")).toEqual(["a", "b", "c"]);
    expect(splitList("")).toEqual([]);
    expect(splitList(null)).toEqual([]);
  });

  it("truncate preserva palavras inteiras", () => {
    expect(truncate("hambúrguer artesanal da casa", 12)).toBe("hambúrguer…");
    expect(truncate("curto", 20)).toBe("curto");
  });
});

describe("links externos", () => {
  it("mantém endereços já completos", () => {
    expect(safeExternalUrl("https://ifood.com.br")).toBe("https://ifood.com.br");
    expect(safeExternalUrl("/cardapio")).toBe("/cardapio");
    expect(safeExternalUrl("mailto:a@b.com")).toBe("mailto:a@b.com");
  });

  it("completa endereços digitados sem protocolo", () => {
    expect(safeExternalUrl("ifood.com.br")).toBe("https://ifood.com.br");
  });

  it("neutraliza tentativas de javascript:", () => {
    expect(safeExternalUrl("javascript:alert(1)")).toBe("https://javascript:alert(1)");
  });

  it("monta o link do WhatsApp com a mensagem", () => {
    const link = whatsappLink("(11) 99999-0000", "Olá!");
    expect(link).toBe("https://wa.me/11999990000?text=Ol%C3%A1!");
  });

  it("devolve vazio sem número", () => {
    expect(whatsappLink("", "oi")).toBe("");
    expect(whatsappLink(null)).toBe("");
  });
});

describe("tema", () => {
  it("converte hexadecimal em canais RGB", () => {
    expect(hexToRgbChannels("#FFFFFF")).toBe("255 255 255");
    expect(hexToRgbChannels("#000")).toBe("0 0 0");
    expect(hexToRgbChannels("#C2410C")).toBe("194 65 12");
  });

  it("escolhe texto legível conforme o fundo", () => {
    expect(readableTextColor("#FFFFFF")).toBe("#1C1917");
    expect(readableTextColor("#1C1917")).toBe("#FFFFFF");
  });

  it("gera as variáveis CSS do site", () => {
    const css = themeStyleSheet(DEFAULT_APPEARANCE);
    expect(css).toContain("--brand-primary: #C2410C");
    expect(css).toContain("--button-radius: 9999px");
    expect(css.startsWith(":root{")).toBe(true);
  });
});

describe("vídeo", () => {
  it("reconhece links do YouTube em vários formatos", () => {
    expect(parseVideoSource("YOUTUBE", "https://www.youtube.com/watch?v=abc123XYZ")).toEqual({
      kind: "youtube",
      id: "abc123XYZ",
    });
    expect(parseVideoSource("YOUTUBE", "https://youtu.be/abc123XYZ")).toEqual({
      kind: "youtube",
      id: "abc123XYZ",
    });
  });

  it("reconhece links do Vimeo", () => {
    expect(parseVideoSource("VIMEO", "https://vimeo.com/123456789")).toEqual({
      kind: "vimeo",
      id: "123456789",
    });
  });

  it("aceita arquivo enviado", () => {
    expect(parseVideoSource("UPLOAD", "https://blob.example/video.mp4")).toEqual({
      kind: "file",
      src: "https://blob.example/video.mp4",
    });
  });

  it("devolve 'none' quando não há vídeo", () => {
    expect(parseVideoSource("YOUTUBE", "")).toEqual({ kind: "none" });
    expect(parseVideoSource("VIMEO", "isso não é um link")).toEqual({ kind: "none" });
  });

  it("monta a URL do player com as opções escolhidas", () => {
    const url = embedUrl(
      { kind: "youtube", id: "abc123XYZ" },
      { autoplay: true, muted: true, loop: true, controls: false },
    );
    expect(url).toContain("youtube-nocookie.com/embed/abc123XYZ");
    expect(url).toContain("autoplay=1");
    expect(url).toContain("mute=1");
    expect(url).toContain("playlist=abc123XYZ");
  });
});

describe("link de pedido", () => {
  const settings: RestaurantSettings = {
    ...DEFAULT_RESTAURANT,
    whatsapp: "5511999990000",
    orderUrl: "",
  };

  it("prioriza o link do próprio produto", () => {
    const link = resolveOrderLink(
      { name: "Burger", orderUrl: "https://ifood.com.br/burger" },
      settings,
      true,
    );
    expect(link).toBe("https://ifood.com.br/burger");
  });

  it("usa o link geral quando o produto não tem um", () => {
    const link = resolveOrderLink({ name: "Burger", orderUrl: null }, {
      ...settings,
      orderUrl: "https://pedidos.example",
    }, true);
    expect(link).toBe("https://pedidos.example");
  });

  it("cai no WhatsApp com o nome do produto na mensagem", () => {
    const link = resolveOrderLink({ name: "Burger", orderUrl: null }, settings, true);
    expect(link).toContain("https://wa.me/5511999990000");
    expect(decodeURIComponent(link)).toContain("Burger");
  });

  it("usa a página de delivery quando não há WhatsApp", () => {
    const link = resolveOrderLink({ name: "Burger", orderUrl: null }, {
      ...settings,
      whatsapp: "",
    }, true);
    expect(link).toBe("/delivery");
  });

  it("não oferece link quando a página de delivery está desligada e não há WhatsApp", () => {
    const link = resolveOrderLink({ name: "Burger", orderUrl: null }, {
      ...settings,
      whatsapp: "",
    }, false);
    expect(link).toBe("");
  });

  it("link geral usa a mensagem padrão do restaurante", () => {
    const link = resolveGeneralOrderLink(settings, true);
    expect(decodeURIComponent(link)).toContain("Vim pelo cardápio");
  });
});
