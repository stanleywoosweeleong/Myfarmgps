# Orchard Locator 果园定位 · Lokasi Dusun

A phone web app that records an orchard's GPS position and sends it by WhatsApp.

- Reads latitude, longitude, accuracy and elevation (GPS altitude, or a map estimate from Open-Meteo when the phone gives none)
- Farmer's name, Chinese location name, English/Malay location name: at least one is required
- Opens WhatsApp to +60 19-382 4740 with the reading filled in (the farmer taps Send)
- Shows the reading on an embedded Google Map (satellite view) as soon as the location is fixed (online only)
- Opens offline once loaded; sending needs internet (the app asks the farmer to connect and tap again)

Live app: https://stanleywoosweeleong.github.io/myfarmgps/

The WhatsApp number is `WA_NUMBER` near the top of the script in `index.html`.
