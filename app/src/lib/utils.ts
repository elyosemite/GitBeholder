import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Project's type scale (App.css @theme static: text-body/row/caption/meta/micro)
// isn't part of Tailwind's default font-size scale, so twMerge's default config
// doesn't recognize it as a font-size utility — it falls into the text-color
// group instead and silently loses to whatever text-color class comes after it,
// leaving a component's built-in text-xs/text-sm untouched as the real winner.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["body", "row", "caption", "meta", "micro"] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
