/**
 * Renders the printable QR-code sheet (`qr_codes.html`).
 *
 * Previously this page hard-coded the deployment URL and station names twelve
 * times. It now derives everything from `js/config.js`, so moving the app or
 * renaming a station only requires editing a single value.
 */

import { APP_CONFIG, STATIONS } from './config.js';

const QR_ENDPOINT = 'https://api.qrserver.com/v1/create-qr-code/';
const QR_PREVIEW_SIZE = '800x800';
const QR_PRINT_SIZE = '1200x1200';
const QR_COLOR = '1a1008'; // dark brown, matches the museum palette

/**
 * Builds a QR-image URL for the given payload.
 *
 * `#` is percent-encoded so QR readers keep the hash router fragment instead of
 * treating it as a document fragment and dropping it.
 *
 * @param {string} target URL the QR code should open
 * @param {string} size   e.g. `800x800`
 * @returns {string}
 */
function qrImageUrl(target, size) {
    const data = target.replace(/#/g, '%23');
    return `${QR_ENDPOINT}?size=${size}&color=${QR_COLOR}&data=${data}`;
}

/**
 * Creates one full-height `.qr-section` card.
 *
 * @param {object} options
 * @param {string} options.icon        emoji shown at the top of the card
 * @param {string} options.badge       small label, e.g. "Station 1 QR"
 * @param {string} [options.badgeClass] extra class for the badge (home variant)
 * @param {string} options.title       card heading
 * @param {string} options.subtitle    short instruction line
 * @param {string} options.target      URL the QR code points at
 * @param {string} options.alt         `<img>` alt text
 * @param {boolean} [options.scrollHint] whether to show the "scroll" hint
 * @returns {HTMLElement}
 */
function buildSection({ icon, badge, badgeClass, title, subtitle, target, alt, scrollHint }) {
    const section = document.createElement('section');
    section.className = 'qr-section';

    const card = document.createElement('div');
    card.className = 'qr-card';

    const iconEl = document.createElement('div');
    iconEl.className = 'qr-icon';
    iconEl.textContent = icon;

    const badgeEl = document.createElement('div');
    badgeEl.className = badgeClass ? `qr-badge ${badgeClass}` : 'qr-badge';
    badgeEl.textContent = badge;

    const titleEl = document.createElement('h2');
    titleEl.className = 'qr-title';
    titleEl.textContent = title;

    const subtitleEl = document.createElement('p');
    subtitleEl.className = 'qr-subtitle';
    subtitleEl.textContent = subtitle;

    const imageWrap = document.createElement('div');
    imageWrap.className = 'qr-image-wrap';
    const img = document.createElement('img');
    img.src = qrImageUrl(target, QR_PREVIEW_SIZE);
    img.alt = alt;
    imageWrap.appendChild(img);

    const urlEl = document.createElement('div');
    urlEl.className = 'qr-url';
    urlEl.textContent = target;

    const download = document.createElement('a');
    download.className = 'print-btn';
    download.href = qrImageUrl(target, QR_PRINT_SIZE);
    download.target = '_blank';
    download.rel = 'noopener';
    download.setAttribute('download', '');
    download.textContent = '⬇ Download High-Res';

    card.append(iconEl, badgeEl, titleEl, subtitleEl, imageWrap, urlEl, download);
    section.appendChild(card);

    if (scrollHint) {
        const hint = document.createElement('span');
        hint.className = 'scroll-hint';
        hint.textContent = '▼ scroll for stations';
        section.appendChild(hint);
    }

    return section;
}

function render() {
    const container = document.getElementById('qr-scroll');
    if (!container) return;

    const homeUrl = `${APP_CONFIG.baseUrl}/`;

    container.appendChild(
        buildSection({
            icon: '🏛️',
            badge: 'Entrance QR',
            badgeClass: 'home-badge',
            title: 'Museum Home',
            subtitle: 'Scan this at the entrance to open the app',
            target: homeUrl,
            alt: 'Home QR Code',
            scrollHint: true
        })
    );

    STATIONS.forEach((station, index) => {
        const stationNumber = index + 1;
        const stationUrl = `${APP_CONFIG.baseUrl}/#/${station.id}`;
        container.appendChild(
            buildSection({
                icon: station.icon,
                badge: `Station ${stationNumber} QR`,
                title: station.name,
                subtitle: `Place this QR code at Station ${stationNumber}`,
                target: stationUrl,
                alt: `Station ${stationNumber} QR Code`
            })
        );
    });
}

render();
