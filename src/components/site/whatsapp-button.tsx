"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle } from "lucide-react";

/** Botão flutuante de WhatsApp, configurável em Admin > Configurações. */
export function WhatsappButton({ href, label }: { href: string; label: string }) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 220);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      initial={false}
      animate={
        reduced
          ? { opacity: 1, scale: 1 }
          : { opacity: visible ? 1 : 0, scale: visible ? 1 : 0.8 }
      }
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      style={{ pointerEvents: visible ? "auto" : "none" }}
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/25 transition-transform hover:scale-[1.04] sm:bottom-7 sm:right-7"
    >
      <MessageCircle className="size-5" aria-hidden />
      <span className="hidden sm:inline">Pedir no WhatsApp</span>
    </motion.a>
  );
}
