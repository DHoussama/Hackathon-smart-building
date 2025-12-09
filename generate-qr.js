import qrcode from 'qrcode-terminal';
import os from 'os';

// Get local network IP
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const ip = getLocalIP();
const port = 5173;
const url = `http://${ip}:${port}`;

console.log('\n📱 Scan this QR code to access the app on your phone:\n');
qrcode.generate(url, { small: true });
console.log(`\n🌐 URL: ${url}\n`);
console.log('Make sure your phone is on the same WiFi network!\n');
