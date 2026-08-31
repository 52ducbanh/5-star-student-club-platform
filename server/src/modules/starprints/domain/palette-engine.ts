import { Injectable } from '@nestjs/common';
import type { StarPalette } from '@5ss/contracts';

@Injectable()
export class PaletteEngine {
  generatePalette(hexColor: string): StarPalette {
    const hsl = this.hexToHsl(hexColor);
    
    const variations = [
      hsl,
      { h: hsl.h + 30, s: hsl.s + 5, l: hsl.l + 5 },
      { h: hsl.h - 20, s: hsl.s + 10, l: hsl.l - 8 },
      { h: hsl.h + 60, s: hsl.s - 10, l: hsl.l + 12 },
      { h: hsl.h + 180, s: hsl.s + 5, l: hsl.l + 3 }
    ];

    return variations.map(v => {
      const h = (v.h % 360 + 360) % 360;
      const s = Math.max(0, Math.min(100, v.s));
      const l = Math.max(0, Math.min(100, v.l));
      return this.hslToHex(h, s, l);
    });
  }

  private hexToHsl(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 0 };
    
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  private hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }
}
