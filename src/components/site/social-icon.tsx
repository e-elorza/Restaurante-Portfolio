import * as React from "react";
import {
  Facebook,
  Instagram,
  Linkedin,
  Music2,
  MessageCircle,
  Twitter,
  Youtube,
  AtSign,
} from "lucide-react";
import type { SocialNetwork } from "@prisma/client";

const ICONS: Record<SocialNetwork, React.ComponentType<{ className?: string }>> = {
  INSTAGRAM: Instagram,
  TIKTOK: Music2,
  FACEBOOK: Facebook,
  YOUTUBE: Youtube,
  X: Twitter,
  WHATSAPP: MessageCircle,
  LINKEDIN: Linkedin,
  THREADS: AtSign,
};

export function SocialIcon({
  network,
  className,
}: {
  network: SocialNetwork;
  className?: string;
}) {
  const Icon = ICONS[network] ?? AtSign;
  return <Icon className={className} aria-hidden />;
}
