// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxt/content", "@nuxt/eslint", "@nuxt/image", "@nuxt/ui"],

  css: ["~/assets/css/main.css"],

  nitro: {
    preset: "cloudflare-pages",
  },

  runtimeConfig: {
    // サーバー側でのみ使用可能
    arduinoUrl: process.env.ARDUINO_URL || "",
    public: {
      // クライアント側でも使用可能（NUXT_PUBLIC_ プレフィックス付き）
      cloudflareTunnelUrl: process.env.NUXT_PUBLIC_CLOUDFLARE_TUNNEL_URL || "",
    },
  },
});
