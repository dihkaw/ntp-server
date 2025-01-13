const socket = io();
const timezoneSelect = document.getElementById('timezone-select');
const setTimezoneButton = document.getElementById('set-timezone');
const currentTimeDisplay = document.getElementById('current-time');
const utcOptions = document.getElementsByName('utc-option');
const defaultTimezoneSelect = document.getElementById('timezone-select');
const customUTCField = document.getElementById('custom-utc');

// Mengisi dropdown dengan zona waktu
const timezones = Intl.supportedValuesOf('timeZone');
timezones.forEach(zone => {
    const option = document.createElement('option');
    option.value = zone;
    option.textContent = zone;
    timezoneSelect.appendChild(option);
});

// Toggle antara UTC default dan custom
utcOptions.forEach(option => {
    option.addEventListener('change', () => {
        if (option.value === 'default') {
            defaultTimezoneSelect.disabled = false; // Aktifkan dropdown
            customUTCField.disabled = true; // Nonaktifkan input custom
            customUTCField.value = ''; // Kosongkan nilai custom
        } else {
            defaultTimezoneSelect.disabled = true; // Nonaktifkan dropdown
            customUTCField.disabled = false; // Aktifkan input custom
        }
    });
});

// Set zona waktu
setTimezoneButton.addEventListener('click', () => {
    const selectedOption = Array.from(utcOptions).find(option => option.checked).value;

    let body;
    if (selectedOption === 'default') {
        body = {
            useCustomUTC: false,
            timezone: timezoneSelect.value,
        };
    } else {
        const customOffset = parseFloat(customUTCField.value);
        if (isNaN(customOffset)) {
            alert('Masukkan nilai UTC custom yang valid!');
            return;
        }
        body = {
            useCustomUTC: true,
            customOffset,
        };
    }

    fetch('/set-timezone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        })
        .catch(err => console.error('Gagal mengatur zona waktu:', err));
});

// Mendapatkan waktu real-time
socket.on('current-time', ({ currentTime, timezone }) => {
    currentTimeDisplay.textContent = `Waktu saat ini (${timezone}): ${currentTime}`;
});
