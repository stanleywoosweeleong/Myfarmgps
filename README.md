# Orchard GPS · 果园坐标 · Dusun GPS

A phone web app that records an orchard's GPS position and sends it by WhatsApp.

- Reads latitude, longitude, position accuracy and elevation. Elevation is the phone's GPS altitude when the phone reports it accurate to 15 m or better; otherwise a map estimate from Open-Meteo (falling back to GPS altitude if that lookup fails)
- Farmer's name is required; of the Chinese and English/Malay location names, at least one is required (each problem is shown under its own field)
- Shows the WhatsApp message first, in the chosen language, in an editable box; then opens WhatsApp to +60 19-382 4740 with that text (the farmer taps Send)
- Shows the reading on a satellite map (Leaflet + Esri imagery, online only) with the GPS accuracy circle
- When GPS is poor the farmer can drag the pin, or tap the map, to the right spot, then taps Lock this spot (required before sending); the message then says "adjusted by farmer" and includes the original GPS reading
- Light and dark mode: follows the phone, with a header button to choose (remembered)
- First launch asks for the language (中文 / English / Bahasa Melayu); the choice is remembered and can be changed with the EN | 中文 | BM switch
- Opens instantly from the copy saved on the phone, works offline; sending needs internet (the app asks the farmer to connect and tap again)
- Unsent details (reading, moved pin, typed names) are saved on the phone as they change and restored after a reload, with a notice and a Discard button; cleared once WhatsApp opens, and after 7 days
- Updates itself: when a newer version is published, a "new version is ready" bar offers Refresh (the current reading and typed names are kept)

Live app: https://stanleywoosweeleong.github.io/Myfarmgps/

QR code: `qr.png` (print size) and `qr.svg` (used in the app).

Privacy: the reading's coordinates are sent to Open-Meteo (elevation lookup) and map tile requests to Esri reveal the area being viewed. Nothing is stored on a server; the farmer's language and light/dark choice are kept on their phone.

The WhatsApp number is `WA_NUMBER` near the top of the script in `index.html`.

## Updating the app

Just commit and push to `main`. There is no version number to change. GitHub Pages publishes in a minute or two; phones that have the app see the "new version is ready" bar the next time they open it (or bring it back to the front) with internet.
