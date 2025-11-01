import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "sans-serif"], // デフォルトのsansを游ゴシックBoldに設定
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        caption: ["var(--font-caption)", "sans-serif"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // アシックス里山スタジアム配色（比率 3:2:1:1:1:1）
        "asics-satoyama": {
          // メインカラー（比率3） - ASICS BLUE
          blue: {
            DEFAULT: "#1F3A93", // ASICS BLUE（推定値）
            50: "rgba(31, 58, 147, 0.05)",
            100: "rgba(31, 58, 147, 0.1)",
            200: "rgba(31, 58, 147, 0.2)",
            300: "rgba(31, 58, 147, 0.3)",
            400: "rgba(31, 58, 147, 0.4)",
            500: "#1F3A93",
            600: "#1B3484",
            700: "#172E75",
            800: "#132866",
            900: "#0F2257",
          },
          // サブカラー（比率2） - 白
          white: {
            DEFAULT: "#FFFFFF",
            50: "#FFFFFF",
            100: "#FEFEFE",
            200: "#FDFDFD",
            300: "#FCFCFC",
            400: "#FBFBFB",
            500: "#FFFFFF",
            600: "#F5F5F5",
            700: "#EEEEEE",
            800: "#E0E0E0",
            900: "#BDBDBD",
          },
          // アクセントカラー（比率1ずつ）
          // 里山1 - 里山グリーン
          green: {
            DEFAULT: "#68B2A0", // 里山グリーン（画像から推定）
            50: "rgba(104, 178, 160, 0.05)",
            100: "rgba(104, 178, 160, 0.1)",
            200: "rgba(104, 178, 160, 0.2)",
            300: "rgba(104, 178, 160, 0.3)",
            400: "rgba(104, 178, 160, 0.4)",
            500: "#68B2A0",
            600: "#5EA190",
            700: "#549080",
            800: "#4A7F70",
            900: "#406E60",
          },
          // 里山2 - 里山ゴールド
          gold: {
            DEFAULT: "#B5985A", // 里山ゴールド（画像から推定）
            50: "rgba(181, 152, 90, 0.05)",
            100: "rgba(181, 152, 90, 0.1)",
            200: "rgba(181, 152, 90, 0.2)",
            300: "rgba(181, 152, 90, 0.3)",
            400: "rgba(181, 152, 90, 0.4)",
            500: "#B5985A",
            600: "#A48951",
            700: "#937A48",
            800: "#826B3F",
            900: "#715C36",
          },
          // 群青
          navy: {
            DEFAULT: "#003273", // FC今治群青
            500: "#003273",
            600: "#002d66",
            700: "#002859",
            800: "#00234c",
            900: "#001e3f",
          },
          // 黄色
          yellow: {
            DEFAULT: "#FFEB00", // FC今治黄
            500: "#FFEB00",
            600: "#e6d400",
            700: "#ccbc00",
            800: "#b3a500",
            900: "#998d00",
          },
        },
        
        // FC今治ブランドカラー（サブ使用）
        "fc-imabari": {
          navy: "#003273",
          yellow: "#FFEB00",
          white: "#FFFFFF",
        },
        // 旧里山カラー（下位互換性のため保持）
        satoyama: {
          green: "#68B2A0", // 新しい里山グリーンに統一
          gold: "#B5985A", // 新しい里山ゴールドに統一
        },
        // 既存の色
        "asics-blue": {
          DEFAULT: "rgb(0, 8, 148)",
          50: "rgba(0, 8, 148, 0.05)",
          100: "rgba(0, 8, 148, 0.1)",
          200: "rgba(0, 8, 148, 0.2)",
          darker: "rgb(0, 5, 120)",
        },
        "satoyama-green": {
          DEFAULT: "rgb(84, 255, 148)",
          300: "rgba(84, 255, 148, 0.3)",
        },
        "satoyama-yellow": {
          DEFAULT: "rgb(128, 130, 38)",
          100: "rgba(128, 130, 38, 0.1)",
        },
        ultramarine: {
          DEFAULT: "rgb(0, 31, 163)",
        },
        "accent-yellow": {
          DEFAULT: "rgb(255, 242, 0)",
          200: "rgba(255, 242, 0, 0.2)",
          300: "rgba(255, 242, 0, 0.3)",
        },
        // 新しい自然系カラーパレット
        "nature": {
          green: {
            DEFAULT: "#4A7C59",  // 森の緑
            light: "#8FBC8F",    // 薄い緑
            dark: "#2F5233",     // 濃い緑
            50: "rgba(74, 124, 89, 0.05)",
            100: "rgba(74, 124, 89, 0.1)",
            200: "rgba(74, 124, 89, 0.2)",
          },
          brown: {
            DEFAULT: "#8B4513",  // 土の茶色
            light: "#D2691E",    // 薄い茶色
            warm: "#A0522D",     // 暖かい茶色
            50: "rgba(139, 69, 19, 0.05)",
            100: "rgba(139, 69, 19, 0.1)",
          },
          sky: {
            DEFAULT: "#87CEEB",  // 空の青
            light: "#E0F6FF",    // 薄い空色
            deep: "#4682B4",     // 深い空色
          },
          grass: {
            DEFAULT: "#7CFC00",  // 草の黄緑
            soft: "#98FB98",     // 柔らかい黄緑
            dark: "#556B2F",     // 濃い黄緑
          },
          sand: {
            DEFAULT: "#F4E4C1",  // 砂のベージュ
            light: "#FFF8DC",    // 薄いベージュ
            warm: "#FFE4B5",     // 暖かいベージュ
          },
          orange: {
            DEFAULT: "#FF8C00",  // 活発なオレンジ
            light: "#FFA500",    // 薄いオレンジ
            coral: "#FF7F50",    // コーラルオレンジ
          },
        },
        // 犬をテーマにした色
        "dog": {
          paw: "#8B7355",        // 肉球の色
          golden: "#FFD700",     // ゴールデンレトリバー
          shiba: "#CD853F",      // 柴犬
          playful: "#FF6B6B",    // 遊び心のある赤
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
