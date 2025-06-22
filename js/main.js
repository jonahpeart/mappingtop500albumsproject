import { buildPopupTemplate, buildDropdownTemplate, buildUnknownAlbumTemplate } from './templates.js';

const bounds = [[-90, -180], [90, 180]];
const map = L.map('map', { maxBounds: bounds, maxBoundsViscosity: 1 }).setView([35.505, -30], 4);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  subdomains: 'abcd',
  noWrap: true,
  minZoom: 3,
  maxZoom: 20,
}).addTo(map);

const markers = L.markerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  spiderfyDistanceMultiplier: 2
});
const introModalWindow = document.querySelector('.intro-modal-window');
const infoModalWindow = document.querySelector('.info-modal-window');
const currentPopup = { popup: null, layer: null };

const createIcon = (url, size, anchor, popupAnchor) =>
  L.icon({ iconUrl: url, iconSize: size, iconAnchor: anchor, popupAnchor: popupAnchor });

const defaultIcon = createIcon('./assets/marker-icons/icon.png', [46, 46], [20, 20], [0, -45]);
const hoverIcon = createIcon('./assets/marker-icons/icon-hover.png', [46, 46], [20, 20], [0, -45]);
const activeIcon = createIcon('./assets/marker-icons/icon-clicked.png', [69, 69], [20, 43], [0, -45]);

fetch('./data/official_top_500.geojson')
  .then(response => {
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.json();
  })
  .then(data => {
    const albumStudiosMap = data.features.reduce((acc, feature) => {
      const album = feature.properties.Album;
      if (!acc[album]) acc[album] = [];
      acc[album].push(feature);
      return acc;
    }, {});
    L.geoJSON(data, {
      pointToLayer: (feature, latlng) => {
        const marker = L.marker(latlng, { icon: defaultIcon });
        marker.defaultIcon = defaultIcon;
        marker.hoverIcon = hoverIcon;
        marker.activeIcon = activeIcon;
        return marker;
      },
      onEachFeature: (feature, layer) => {
        const albumName = feature.properties.Album;
        const studios = (albumStudiosMap[albumName] || [])
          .filter(entry => entry.properties.Studio !== feature.properties.Studio)
          .map(entry => ({
            name: entry.properties.Studio,
            coords: entry.geometry?.coordinates,
            location: entry.properties.Location
          }));
        const dropdown = buildDropdownTemplate(studios);
        const customPopup = buildPopupTemplate(feature, dropdown);
        const popup = L.popup({
          className: 'popupCustom',
          closeButton: false,
          autoClose: false,
          closeOnClick: false,
          offset: [60, -170],
        }).setContent(customPopup);

        layer.on('mouseover', () => {
          if (currentPopup.popup !== popup) layer.setIcon(hoverIcon);
        });

        layer.on('mouseout', () => {
          if (currentPopup.popup !== popup) layer.setIcon(defaultIcon);
        });

        layer.on('click', (e) => {
          if (currentPopup.popup) {
            map.closePopup(currentPopup.popup);
            currentPopup.layer.setIcon(defaultIcon);
            currentPopup.popup = null;
          }

          popup.setLatLng(e.latlng).openOn(map);
          layer.setIcon(activeIcon);

          // Move window to center the popup on click
          const offset = window.innerWidth < 800
            ? { x: window.innerWidth * 0.25, y: window.innerHeight * 0.1 }
            : { x: 0, y: 0 };

          if (offset.x || offset.y) {
            const point = map.project(e.latlng, map.getZoom());
            map.panTo(map.unproject({ x: point.x + offset.x, y: point.y + offset.y }, map.getZoom()), { animate: true });
          } else {
            map.panTo(e.latlng, { animate: true });
          }

          currentPopup.popup = popup;
          currentPopup.layer = layer;
          
          popup.getElement().querySelectorAll('.dropdown-content a[data-lat]').forEach(link => {
            link.addEventListener('click', ev => {
              ev.preventDefault();
              map.flyTo([parseFloat(link.dataset.lat), parseFloat(link.dataset.lng)], 18, { duration: 2 });
            });
          });
        });
        markers.addLayer(layer);
      }
    });
    map.addLayer(markers);

    // Adds Albums with no known locations of recording studios to the information modal details
    const unknownAlbumsList = document.getElementById("unknown-albums");
    data.features.forEach(feature => {
      if (feature.properties["No Known Location"]?.toString().toLowerCase() === "yes") {
        unknownAlbumsList.insertAdjacentHTML("beforeend", buildUnknownAlbumTemplate(feature));
      }
    });

  }).catch(console.error);
map.on('click zoomstart dragstart', () => {
  if (currentPopup.popup) {
    map.closePopup(currentPopup.popup);
    currentPopup.layer.setIcon(defaultIcon);
    currentPopup.popup = null;
  }
});

const toggleModal = (el, state) => el.style.display = state;
document.querySelector('.explore-map-btn').addEventListener('click', () => toggleModal(introModalWindow, 'none'));
document.querySelector('.open-info-btn').addEventListener('click', () => toggleModal(infoModalWindow, 'flex'));
document.querySelector('.close-info-modal-btn').addEventListener('click', () => toggleModal(infoModalWindow, 'none'));