export function buildPopupTemplate(feature, dropdownHTML) {
  return `
    <div class="popup">
      <div class="cover">
        <img src="./assets/covers/${feature.properties.rank}.jpg" alt="${feature.properties.Album} cover">
      </div>
      <div class="album-info-container">
        <div class="info-container">
          <div class="album-popup-title">${feature.properties.Album}</div>
          <div class="artist">${feature.properties.Artist}, ${feature.properties.Year}</div>
          <div class="rank">#${feature.properties.rank}</div>
        </div>
        <div class="studio-info-container">
          <div class="studio-source-flex">
            <div class="studio">Studio: ${feature.properties.Studio}</div>
            <a class="source" href="${feature.properties.Source}" target="_blank">
              <span class="material-symbols-outlined">info</span>
            </a>
          </div>
          <div class="notes">${feature.properties.Notes || ""}</div>
          <div class="other-studios">${dropdownHTML}</div>
        </div>
      </div>
    </div>
  `;
}

export function buildDropdownTemplate(studios) {
  if (!studios.length) return '';
  return `
    <div class="dropdown">
      <button class="dropbtn"><i class="fa fa-caret-down"></i> Other Studios</button>
      <div class="dropdown-content">
        ${studios.map(studio => studio.coords
          ? `<a class="studio-dropdown-item" href="#" data-lat="${studio.coords[1]}" data-lng="${studio.coords[0]}">${studio.name}</a>`
          : `<a style="color: black;" href="#">${studio.name} - <small>(${studio.location})</small></a>`
        ).join('')}
      </div>
    </div>
  `;
}

export function buildUnknownAlbumTemplate(feature) {
  return `
    <div class="unknown-popup">
      <div class="unknown-location-cover">
        <img src="./assets/covers/${feature.properties.rank}.jpg" alt="${feature.properties.Album} cover">
      </div>
      <div class="info-container">
        <div><i><b>${feature.properties.Album}</b></i>, ${feature.properties.Artist}, ${feature.properties.Year}</div>
        <div class="rank">#${feature.properties.rank}</div>
        <div>Studio: ${feature.properties.Studio}</div>
        <div>${feature.properties.Location || ""}</div>
        <a href="${feature.properties.Source}" target="_blank">
          <span class="material-symbols-outlined">info</span>
        </a>
      </div>
    </div>
  `;
}
