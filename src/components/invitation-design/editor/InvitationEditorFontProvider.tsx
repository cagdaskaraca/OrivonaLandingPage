"use client";

import {
  Cinzel,
  Great_Vibes,
  Montserrat,
  Playfair_Display,
  Poppins,
} from "next/font/google";
import type { ReactNode } from "react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-inv-playfair",
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-inv-great-vibes",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-inv-cinzel",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-inv-montserrat",
});

const poppins = Poppins({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-inv-poppins",
});

export function InvitationEditorFontProvider({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${playfair.variable} ${greatVibes.variable} ${cinzel.variable} ${montserrat.variable} ${poppins.variable}`}
    >
      {children}
    </div>
  );
}
