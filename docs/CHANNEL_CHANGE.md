1. Control App posts to `/ogdevice/changechannel` via ogAPI.
2. Bellini-DM does a websocket blast to the Android box with a TUNE message.
3. The Android box dispatches this message to the DirecTVAPI that POSTs to the STB.

-- That's it, no ACK is expected, but ... --

The Bucanero poll loop will pick up the change (if it was successful) and POST
this up to Bellini-DM via `/ogdevice/programchange`.

That endpoint logs the change on the OGDevice model and burps out a Socket IO message to:
`sysmsg:<udid>`.