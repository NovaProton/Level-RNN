// =========================
// GLOBAL SETTINGS
// =========================
let settings = {
    apiKey: '',      // user-provided API key
    fields: []       // which fields to display in device modal
};

function loadSettingsFromLocalStorage() {
    const saved = localStorage.getItem('myAppSettings');
    if (saved) {
        settings = JSON.parse(saved);
    } else {
        // If nothing in localStorage, set some defaults:
        settings = {
            apiKey: '',
            fields: [
                'hostname', 'nickname', 'role', 'group_id', 'tags',
                'maintenance_mode', 'status', 'platform', 'serial_number',
                'model', 'manufacturer', 'architecture', 'total_memory',
                'memory_slots', 'cpu_cores', 'last_logged_in_user',
                'last_reboot_time', 'public_ip_address', 'private_ip_addresses',
                'city', 'country', 'security_score'
            ]
        };
    }
}

function saveSettingsToLocalStorage() {
    localStorage.setItem('myAppSettings', JSON.stringify(settings));
}

// =========================
// API endpoints (no longer hardcoded key)
// =========================
const alertsApiUrl = 'https://api.level.io/v2/alerts';
const devicesApiUrl = 'https://api.level.io/v2/devices';

// We'll use `settings.apiKey` for requests instead of a hardcoded key.
function getAuthHeaders() {
    return {
        Authorization: settings.apiKey || '' // fallback if blank
    };
}

let alertsData = [];
let devicesData = [];

// =========================
// DEVICES
// =========================
function fetchDevices() {
    fetch(devicesApiUrl, { headers: getAuthHeaders() })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            devicesData = data.data;
            renderDevices('all');
        })
        .catch(error => {
            console.error('Error fetching devices:', error);
            document.getElementById('deviceList').innerHTML =
                '<p>Error fetching devices data.</p>';
        });
}

function renderDevices(filter = 'all') {
    const container = document.getElementById('deviceList');
    container.innerHTML = '';
    container.classList.add('devices-grid'); // ensure we have grid styling

    let filteredDevices = devicesData;
    if (filter === 'online') {
        filteredDevices = devicesData.filter(device => device.online);
    } else if (filter === 'offline') {
        filteredDevices = devicesData.filter(device => !device.online);
    }

    const onlineCount = devicesData.filter(d => d.online).length;
    const offlineCount = devicesData.length - onlineCount;
    document.getElementById('deviceCounts').textContent =
        `(${onlineCount} online, ${offlineCount} offline)`;

    if (filteredDevices.length === 0) {
        container.innerHTML = '<p>No devices found.</p>';
        return;
    }

    filteredDevices.forEach(device => {
        const tile = document.createElement('div');
        tile.classList.add('device-tile', device.online ? 'online' : 'offline');

        // Show only Hostname & Nickname on the tile
        tile.innerHTML = `
      <div>${device.hostname}</div>
      <div>${device.nickname || 'No nickname'}</div>
    `;

        tile.addEventListener('click', () => {
            fetchDeviceDetails(device.id);
        });
        container.appendChild(tile);
    });
}

function fetchDeviceDetails(deviceId) {
    const url = `${devicesApiUrl}/${deviceId}`;
    fetch(url, { headers: getAuthHeaders() })
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch device details');
            return response.json();
        })
        .then(device => {
            renderDeviceModal(device);
        })
        .catch(error => {
            console.error('Error fetching device details:', error);
        });
}

// This function checks the settings.fields array and only displays the fields the user wants
function renderDeviceModal(device) {
    const modal = document.getElementById('deviceModal');
    const modalContent = document.getElementById('modalDeviceDetails');

    // Build HTML for each field if it's in settings.fields
    let html = `<h3>Device Details</h3>`;

    if (settings.fields.includes('hostname')) {
        html += `<p><strong>Hostname:</strong> ${device.hostname}</p>`;
    }
    if (settings.fields.includes('nickname')) {
        html += `<p><strong>Nickname:</strong> ${device.nickname || 'N/A'}</p>`;
    }
    if (settings.fields.includes('role')) {
        html += `<p><strong>Role:</strong> ${device.role}</p>`;
    }
    if (settings.fields.includes('group_id')) {
        html += `<p><strong>Group ID:</strong> ${device.group_id}</p>`;
    }
    if (settings.fields.includes('tags')) {
        html += `<p><strong>Tags:</strong> ${device.tags.join(', ')}</p>`;
    }
    if (settings.fields.includes('maintenance_mode')) {
        html += `<p><strong>Maintenance Mode:</strong> ${device.maintenance_mode}</p>`;
    }
    if (settings.fields.includes('status')) {
        html += `
      <p><strong>Status:</strong>
        <span class="${device.online ? 'online' : 'offline'}">
          ${device.online ? 'Online' : 'Offline'}
        </span>
      </p>
    `;
    }
    if (settings.fields.includes('platform')) {
        html += `<p><strong>Platform:</strong> ${device.platform}</p>`;
    }
    if (settings.fields.includes('serial_number')) {
        html += `<p><strong>Serial Number:</strong> ${device.serial_number || 'N/A'}</p>`;
    }
    if (settings.fields.includes('model')) {
        html += `<p><strong>Model:</strong> ${device.model || 'N/A'}</p>`;
    }
    if (settings.fields.includes('manufacturer')) {
        html += `<p><strong>Manufacturer:</strong> ${device.manufacturer || 'N/A'}</p>`;
    }
    if (settings.fields.includes('architecture')) {
        html += `<p><strong>Architecture:</strong> ${device.architecture}</p>`;
    }
    if (settings.fields.includes('total_memory')) {
        html += `<p><strong>Total Memory:</strong> ${device.total_memory}</p>`;
    }
    if (settings.fields.includes('memory_slots')) {
        html += `<p><strong>Memory Slots:</strong> ${device.memory_slots}</p>`;
    }
    if (settings.fields.includes('cpu_cores')) {
        html += `<p><strong>CPU Cores:</strong> ${device.cpu_cores}</p>`;
    }
    if (settings.fields.includes('last_logged_in_user')) {
        html += `<p><strong>Last Logged In User:</strong> ${device.last_logged_in_user}</p>`;
    }
    if (settings.fields.includes('last_reboot_time')) {
        html += `<p><strong>Last Reboot Time:</strong>
      ${new Date(device.last_reboot_time).toLocaleString()}
    </p>`;
    }
    if (settings.fields.includes('public_ip_address')) {
        html += `<p><strong>Public IP Address:</strong> ${device.public_ip_address}</p>`;
    }
    if (settings.fields.includes('private_ip_addresses')) {
        html += `<p><strong>Private IP Addresses:</strong>
      ${device.private_ip_addresses.join(', ')}
    </p>`;
    }
    if (settings.fields.includes('city')) {
        html += `<p><strong>City:</strong> ${device.city}</p>`;
    }
    if (settings.fields.includes('country')) {
        html += `<p><strong>Country:</strong> ${device.country}</p>`;
    }
    if (settings.fields.includes('security_score')) {
        html += `<p><strong>Security Score:</strong> ${device.security_score}</p>`;
    }

    modalContent.innerHTML = html;
    modal.style.display = 'block';
}

// Close device modal
document.getElementById('modalCloseBtn').addEventListener('click', () => {
    document.getElementById('deviceModal').style.display = 'none';
});
window.addEventListener('click', event => {
    const modal = document.getElementById('deviceModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// =========================
// ALERTS
// =========================
function fetchAlerts() {
    fetch(alertsApiUrl, {
        headers: { Authorization: settings.apiKey }
    })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            alertsData = data.data;
            showActiveAlerts();
        })
        .catch(error => {
            console.error('Error fetching alerts:', error);
            document.getElementById('alertsContainer').innerHTML =
                '<p>Error fetching alerts data.</p>';
        });
}

function showActiveAlerts() {
    const container = document.getElementById('alertsContainer');
    container.innerHTML = '<h2>Active Alerts <span id="activeAlertsCount"></span></h2>      ';

    // Apply a grid layout (CSS class we'll define in index.css)
    container.classList.add('alerts-grid');

    const activeAlerts = alertsData.filter(alert => !alert.is_resolved);
    document.getElementById('activeAlertsCount').textContent = `(${activeAlerts.length})`;

    if (activeAlerts.length === 0) {
        container.innerHTML += '<p>No active alerts.</p>';
        return;
    }

    activeAlerts.forEach(alert => {
        const alertDiv = document.createElement('div');
        // We'll reuse your existing 'alert' class, add a new 'alert-tile' class, plus severity
        alertDiv.classList.add('alert', 'alert-tile', alert.severity);

        alertDiv.innerHTML = `
      <strong>${alert.name}</strong><br>
      ${alert.description}<br>
      <small>Started at: ${new Date(alert.started_at).toLocaleString()}</small>
    `;

        // Clicking an alert tile will open the modal
        alertDiv.addEventListener('click', () => {
            renderAlertModal(alert);
        });

        container.appendChild(alertDiv);
    });
}

function renderAlertModal(alert) {
    const modal = document.getElementById('alertModal');
    const modalContent = document.getElementById('modalAlertDetails');

    let html = `<h3>Alert Details</h3>`;
    html += `<p><strong>Name:</strong> ${alert.name}</p>`;
    html += `<p><strong>Description:</strong> ${alert.description}</p>`;
    html += `<p><strong>Severity:</strong> ${alert.severity}</p>`;
    html += `<p><strong>Started at:</strong> ${new Date(alert.started_at).toLocaleString()}</p>`;

    if (alert.is_resolved) {
        html += `<p><strong>Resolved at:</strong> ${new Date(alert.resolved_at).toLocaleString()}</p>`;
    }

    modalContent.innerHTML = html;
    modal.style.display = 'block';
}

// Close Alert Modal
document.getElementById('alertModalCloseBtn').addEventListener('click', () => {
    document.getElementById('alertModal').style.display = 'none';
});

// Optional: close the modal if user clicks outside it
window.addEventListener('click', event => {
    const alertModal = document.getElementById('alertModal');
    if (event.target === alertModal) {
        alertModal.style.display = 'none';
    }
});



function showResolvedAlerts() {
    const container = document.getElementById('alertsContainer');
    container.innerHTML = '<h2>Resolved Alerts</h2>';
    const resolvedAlerts = alertsData.filter(alert => alert.is_resolved);

    if (resolvedAlerts.length === 0) {
        container.innerHTML += '<p>No resolved alerts.</p>';
        return;
    }
    resolvedAlerts.forEach(alert => {
        const alertDiv = document.createElement('div');
        alertDiv.classList.add('alert', alert.severity);
        alertDiv.innerHTML = `
      <strong>${alert.name}</strong><br>
      ${alert.description}<br>
      <small>Started at: ${new Date(alert.started_at).toLocaleString()}</small><br>
      <small>Resolved at: ${new Date(alert.resolved_at).toLocaleString()}</small>
    `;
        container.appendChild(alertDiv);
    });
}



document.getElementById('activeBtn').addEventListener('click', showActiveAlerts);
document.getElementById('resolvedBtn').addEventListener('click', showResolvedAlerts);

// =========================
// DEVICE FILTER BUTTONS
// =========================
document.getElementById('allDevicesBtn').addEventListener('click', () => renderDevices('all'));
document.getElementById('onlineDevicesBtn').addEventListener('click', () => renderDevices('online'));
document.getElementById('offlineDevicesBtn').addEventListener('click', () => renderDevices('offline'));

// =========================
// SETTINGS MODAL LOGIC
// =========================
const settingsModal = document.getElementById('settingsModal');
const openSettingsBtn = document.getElementById('openSettingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const apiKeyInput = document.getElementById('apiKeyInput');

// Show the settings modal
openSettingsBtn.addEventListener('click', () => {
    // Load the current settings into the form
    apiKeyInput.value = settings.apiKey;

    // For each checkbox, check it if the field is in settings.fields
    const checkboxes = document.querySelectorAll('#settingsForm input[name="fields"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = settings.fields.includes(checkbox.value);
    });

    settingsModal.style.display = 'block';
});

// Hide the settings modal
closeSettingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});
window.addEventListener('click', event => {
    if (event.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
});

// Save settings
saveSettingsBtn.addEventListener('click', () => {
    // Save API key
    settings.apiKey = apiKeyInput.value.trim();

    // Save the list of checked fields
    const checkedBoxes = document.querySelectorAll('#settingsForm input[name="fields"]:checked');
    settings.fields = Array.from(checkedBoxes).map(cb => cb.value);

    // Save to localStorage
    saveSettingsToLocalStorage();

    // Close modal
    settingsModal.style.display = 'none';
    // Optionally, re-fetch devices with the new API key or re-render
    // fetchDevices();
});

// =========================
// INITIAL PAGE LOAD
// =========================
window.onload = function() {
    // Load user settings from localStorage
    loadSettingsFromLocalStorage();
    // Then fetch data using the stored (or default) settings
    fetchDevices();
    fetchAlerts();
};
