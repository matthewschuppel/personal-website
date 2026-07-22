# WestWall firmware

Production firmware for the Adafruit MatrixPortal S3 and 128x64 RGB panel.

The device polls MatthewOS for the active render payload, posts a heartbeat
every 45 seconds, checks the command queue, and acknowledges completed commands.
Secrets belong only in `settings.toml` on the CIRCUITPY drive and in the
Cloudflare `WESTWALL_DEVICE_TOKEN` secret.
