const CACHE_NAME = 'calc-caixa-cache-v1';

// Arquivos principais do app shell para cachear na instalação.
// O restante será cacheado dinamicamente pela estratégia de fetch.
const APP_SHELL_URLS = [
  '/',
  'index.html',
  'manifest.webmanifest'
];

// Evento de Instalação: Cacheia o App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Cacheando o App Shell');
      return cache.addAll(APP_SHELL_URLS);
    })
  );
  self.skipWaiting();
});

// Evento de Ativação: Limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Limpando cache antigo', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Evento de Fetch: Estratégia "Cache first, then network" (com cache dinâmico)
// Isso fará com que todos os arquivos (CDNs, JS, etc.) sejam cacheados na primeira visita.
self.addEventListener('fetch', (event) => {
  // Ignora requisições que não são GET (como POST, etc.)
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignora requisições para extensões do Chrome
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Tenta buscar do cache
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        // console.log('SW: Servindo do cache:', event.request.url);
        return cachedResponse;
      }

      // 2. Se não está no cache, busca na rede
      try {
        const networkResponse = await fetch(event.request);
        
        // 3. Armazena a resposta válida no cache para futuras visitas
        // Verifica se a resposta é válida antes de cachear
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic' || networkResponse.type === 'cors') {
          // console.log('SW: Cacheando nova requisição:', event.request.url);
          // Clona a resposta, pois ela só pode ser consumida uma vez
          cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        // Falha ao buscar da rede (provavelmente offline)
        console.error('SW: Falha no Fetch, offline?', event.request.url, error);
        // Opcional: retornar uma página de fallback offline
        // return caches.match('offline.html');
      }
    })
  );
});
