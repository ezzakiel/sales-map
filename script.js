// Initialize Leaflet map
const map = L.map('map').setView([42.9849, -81.2452], 17); // London, Ontario coordinates
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
}).addTo(map);

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDyGkDkWGVxcGVm19s0q033e6BpgbOLZ3A",
    authDomain: "salesmap-20162.firebaseapp.com",
    projectId: "salesmap-20162",
    storageBucket: "salesmap-20162.firebasestorage.app",
    messagingSenderId: "974851563054",
    appId: "1:974851563054:web:66fffbe36aa34b0e7f49bf"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Marker management
let markers = [];
let selectedEmoji = '✅';

function setEmoji(emoji) {
    selectedEmoji = emoji;
    document.querySelectorAll('#emoji-bar button').forEach(btn => {
        btn.style.backgroundColor = btn.innerText.includes(emoji) ? '#e0e0e0' : '';
    });
}

// Add marker on click
map.on('click', function(e) {
    const markerId = Date.now().toString();
    const marker = L.marker([e.latlng.lat, e.latlng.lng], {
        icon: L.divIcon({ 
            html: selectedEmoji, 
            className: 'emoji-marker',
            iconSize: [24, 24]
        })
    }).addTo(map);
    marker.bindPopup(`<button onclick="deleteMarker('${markerId}')">Delete</button>`);
    markers.push({ id: markerId, marker: marker });
    db.collection('markers').doc(markerId).set({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
        emoji: selectedEmoji,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(error => console.error("Error adding marker: ", error));
});

// Load markers from Firebase
db.collection('markers').onSnapshot(snapshot => {
    markers.forEach(m => map.removeLayer(m.marker));
    markers = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        const marker = L.marker([data.lat, data.lng], {
            icon: L.divIcon({ 
                html: data.emoji, 
                className: 'emoji-marker',
                iconSize: [24, 24]
            })
        }).addTo(map);
        marker.bindPopup(`<button onclick="deleteMarker('${doc.id}')">Delete</button>`);
        markers.push({ id: doc.id, marker: marker });
    });
}, error => console.error("Error loading markers: ", error));

// Delete marker
function deleteMarker(id) {
    db.collection('markers').doc(id).delete().catch(error => console.error("Error deleting marker: ", error));
}