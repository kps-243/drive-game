export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  app: {
    baseURL: '/drive-game/', // ← ici le "/" devant et derrière est très important !
  },
  nitro: {
    prerender: {
      routes: [
        '/',           // page d’accueil
        '/200.html',   // pour GitHub Pages
        '/404.html'    // page d’erreur
      ]
    }
  }
})
