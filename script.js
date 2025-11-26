// script.js
// Completely rebuilt with initial geolocation zoom + modular structure

let CONFIG = {};
let map;
let userMarker;

// Load config.cfg
async function loadConfig() {
    const response = await fetch('config.cfg');
    const text = await response.text();
    const lines = text.split(/\r?\n/);

    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, value] = trimmed.split('=');
            CONFIG[key.trim()] = value.trim();
        }
    });

    console.log('Config loaded:', CONFIG);
}

// Initialize map
async function initMap() {
    await loadConfig();

    map = L.map('map', {
        zoomControl: false,
        center: [59.334591, 18.063240],
        zoom: 6
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    // Try to zoom to user location
    getUserLocation();

    // Load incidents
    fetchIncidents();
}

// Geolocation zoom
function getUserLocation() {
    if (!navigator.geolocation) {
        console.warn('Geolocation unsupported');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        pos => {
            const { latitude, longitude } = pos.coords;
            map.setView([latitude, longitude], 14);

            if (userMarker) map.removeLayer(userMarker);
            userMarker = L.marker([latitude, longitude]).addTo(map).bindPopup('Du är här');
        },
        err => console.warn('Geolocation error:', err),
        { enableHighAccuracy: true }
    );
}

// Fetch Trafikverket incidents
async function fetchIncidents() {
    const query = `<?xml version="1.0" encoding="utf-8"?>
    <REQUEST>
        <LOGIN authenticationkey="${CONFIG.TRAFIKVERKET_API_KEY}" />
        <QUERY objecttype="Situation" schemaversion="1.4"></QUERY>
    </REQUEST>`;

    const response = await fetch(CONFIG.TRAFIKVERKET_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/xml' },
        body: query
    });

    const xml = await response.text();
    console.log('Incidents:', xml);

    // TODO: Parse XML and show markers
}

// Search using Nominatim
async function searchLocation(query) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=10`;
    const res = await fetch(url);
    return res.json();
}

// UI Toggles
function toggleRecenter() {
    if (!userMarker) return;
    map.setView(userMarker.getLatLng(), 14);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

function toggleMobileMode(state) {
    document.body.classList.toggle('mobile-mode', state);
}

function toggleCompressedMode(state) {
    document.body.classList.toggle('compressed', state);
}

// Routing (placeholder)
async function getRoutes(from, to) {
    console.log('Routing requested:', { from, to });
}

// Avoid cities (placeholder)
async function avoidCities(list) {
    console.log('Avoiding cities:', list);
}

window.onload = initMap;
