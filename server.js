const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const moment = require('moment-timezone');
const dgram = require('dgram');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let currentTimeZone = 'UTC'; // Zona waktu default
let customUTCOffset = null; // Offset UTC custom (dalam jam)

// Middleware untuk melayani file statis
app.use(express.static('public'));

// Endpoint untuk mengubah zona waktu atau menggunakan custom UTC
app.post('/set-timezone', express.json(), (req, res) => {
    const { timezone, useCustomUTC, customOffset } = req.body;

    if (useCustomUTC) {
        if (typeof customOffset !== 'number') {
            return res.status(400).json({ error: 'Nilai offset harus berupa angka' });
        }
        customUTCOffset = customOffset;
        currentTimeZone = null; // Nonaktifkan zona waktu default
    } else {
        if (!moment.tz.zone(timezone)) {
            return res.status(400).json({ error: 'Zona waktu tidak valid' });
        }
        customUTCOffset = null;
        currentTimeZone = timezone;
    }

    io.emit('update-timezone', { timezone: currentTimeZone, customUTCOffset });
    res.json({ message: 'Zona waktu diperbarui', timezone: currentTimeZone, customUTCOffset });
});

// Kirim waktu secara real-time ke WebSocket
setInterval(() => {
    let currentTime;
    if (customUTCOffset !== null) {
        currentTime = moment.utc().add(customUTCOffset, 'hours').format('DD/MM/YYYY HH:mm:ss');
    } else {
        currentTime = moment().tz(currentTimeZone).format('DD/MM/YYYY HH:mm:ss');
    }

    io.emit('current-time', {
        currentTime,
        timezone: customUTCOffset !== null ? `UTC${customUTCOffset >= 0 ? '+' : ''}${customUTCOffset}` : currentTimeZone,
    });
}, 1000);

// Menjalankan server HTTP
const HTTP_PORT = 3000;
server.listen(HTTP_PORT, () => {
    console.log(`Web server berjalan di http://localhost:${HTTP_PORT}`);
});
