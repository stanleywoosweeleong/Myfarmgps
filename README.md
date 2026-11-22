# Orchard Locator 果园定位 · Lokasi Dusun

A phone web app that records an orchard's GPS position and sends it by WhatsApp.

- Reads latitude, longitude, accuracy and elevation (GPS altitude, or a map estimate from Open-Meteo when the phone gives none)
- Farmer's name, Chinese location name, English/Malay location name: at least one is required
- Opens WhatsApp to +60 19-382 4740 with the reading filled in (the farmer taps Send)
- Shows the reading on a satellite map (Leaflet + Esri imagery, online only) with the GPS accuracy circle
- When GPS is poor the farmer can drag the pin, or tap the map, to the right spot; the message then says "adjusted by farmer" and includes the original GPS reading
- Light and dark mode: follows the phone, with a header button to choose (remembered)
- Opens offline once loaded; sending needs internet (the app asks the farmer to connect and tap again)

Live app: https://stanleywoosweeleong.github.io/Myfarmgps/

QR code: `qr.png` (print size) and `qr.svg` (used in the app).

The WhatsApp number is `WA_NUMBER` near the top of the script in `index.html`.
