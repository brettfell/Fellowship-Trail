const CACHE_NAME = 'fellowship-trail-v3'; 

const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './icon.png',

    // Core UI & Actions
    './waterfall.gif', './walking.gif', './camp.gif', './meat-good.gif', 
    './kingsfoil.gif', './pipeweed.gif',

    // Random Events
    './spider.gif', './gollum.gif', './gollum-pouting.gif', './meat-bad.gif', 
    './trade.gif', './figwit.gif', './ranger-trade.gif', './nazgul.gif',

    // Landmarks & Hazards
    './landmark.gif', './caradhras.gif', './moria.gif', './ambush.gif', 
    './deadmarshes.gif', './blackgate.gif', './shelob.gif', './victory.gif',

    // Character Status
    './frodo-status.gif', './sam-status.gif', './aragorn-status.gif', 
    './legolas-status.gif', './gimli-status.gif', './gandalf-status.gif', 
    './merry-status.gif', './pippin-status.gif',

    // Character Fallen
    './frodo-fallen.gif', './sam-fallen.gif', './aragorn-fallen.gif', 
    './legolas-fallen.gif', './gimli-fallen.gif', './gandalf-fallen.gif', 
    './merry-fallen.gif', './pippin-fallen.gif'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                  .map(name => caches.delete(name))
            );
        })
    );
});
