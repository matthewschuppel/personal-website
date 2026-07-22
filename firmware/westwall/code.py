"""WestWall production firmware.

Adafruit MatrixPortal S3 + Adafruit 128x64 RGB LED matrix (product 6484).
Configuration is read from settings.toml on the CIRCUITPY drive.
"""

import gc
import json
import os
import ssl
import time

import adafruit_requests
import board
import displayio
import framebufferio
import microcontroller
import rgbmatrix
import socketpool
import terminalio
import wifi
from adafruit_display_text import label


FIRMWARE_VERSION = "1.0.0"
WIDTH = 128
HEIGHT = 64
POLL_SECONDS = 15
CHECKIN_SECONDS = 45
COMMAND_SECONDS = 10

API_BASE = os.getenv("WESTWALL_API_URL", "https://matthewschuppel.com").rstrip("/")
DEVICE_TOKEN = os.getenv("WESTWALL_DEVICE_TOKEN", "")
WIFI_SSID = os.getenv("CIRCUITPY_WIFI_SSID", "")
WIFI_PASSWORD = os.getenv("CIRCUITPY_WIFI_PASSWORD", "")

if not WIFI_SSID or not WIFI_PASSWORD or not DEVICE_TOKEN:
    raise RuntimeError("Add Wi-Fi and WestWall values to settings.toml")


def setup_display():
    displayio.release_displays()
    matrix = rgbmatrix.RGBMatrix(
        width=WIDTH,
        height=HEIGHT,
        bit_depth=2,
        rgb_pins=[
            board.MTX_B1,
            board.MTX_G1,
            board.MTX_R1,
            board.MTX_B2,
            board.MTX_G2,
            board.MTX_R2,
        ],
        addr_pins=[
            board.MTX_ADDRA,
            board.MTX_ADDRB,
            board.MTX_ADDRC,
            board.MTX_ADDRD,
            board.MTX_ADDRE,
        ],
        clock_pin=board.MTX_CLK,
        latch_pin=board.MTX_LAT,
        output_enable_pin=board.MTX_OE,
        tile=1,
        serpentine=True,
        doublebuffer=True,
    )
    return framebufferio.FramebufferDisplay(matrix, auto_refresh=True)


display = setup_display()
root = displayio.Group()
display.root_group = root

header = label.Label(terminalio.FONT, text="WESTWALL", color=0xFF7800, x=2, y=5)
line_labels = [
    label.Label(terminalio.FONT, text="", color=0xFFFFFF, x=2, y=20),
    label.Label(terminalio.FONT, text="", color=0xFFFFFF, x=2, y=34),
    label.Label(terminalio.FONT, text="", color=0xFFFFFF, x=2, y=48),
]
status = label.Label(terminalio.FONT, text="BOOTING", color=0x00FF40, x=2, y=60)
root.append(header)
for text_label in line_labels:
    root.append(text_label)
root.append(status)

current_screen = "boot"
current_payload = None


def fit(text, max_characters=21):
    value = str(text or "").strip()
    if len(value) <= max_characters:
        return value
    return value[: max_characters - 1] + "~"


def show_lines(lines, screen="message", heading=None):
    global current_screen
    current_screen = screen
    header.text = fit((heading or screen).replace("-", " ").upper(), 20)
    for index, text_label in enumerate(line_labels):
        text_label.text = fit(lines[index] if index < len(lines) else "")
    status.text = "ONLINE"


def show_status(message, color=0x00FF40):
    status.color = color
    status.text = fit(message.upper(), 20)


def connect_wifi():
    if wifi.radio.connected:
        return
    show_status("CONNECTING WIFI", 0xFFB000)
    wifi.radio.connect(WIFI_SSID, WIFI_PASSWORD)
    show_status("WIFI CONNECTED")


def request_json(method, path, body=None):
    connect_wifi()
    headers = {
        "Authorization": "Bearer " + DEVICE_TOKEN,
        "Accept": "application/json",
    }
    if body is not None:
        headers["Content-Type"] = "application/json"

    response = None
    try:
        url = API_BASE + path
        if method == "GET":
            response = session.get(url, headers=headers, timeout=12)
        else:
            response = session.post(url, headers=headers, data=json.dumps(body), timeout=12)

        if response.status_code < 200 or response.status_code >= 300:
            raise RuntimeError("HTTP {}".format(response.status_code))
        return response.json()
    finally:
        if response is not None:
            response.close()
        gc.collect()


def fetch_current():
    global current_payload
    payload = request_json("GET", "/api/westwall/current")
    if payload != current_payload:
        current_payload = payload
        show_lines(
            payload.get("lines", ["WestWall Ready"]),
            payload.get("screen", "message"),
            payload.get("label"),
        )


def send_checkin(started_at):
    request_json(
        "POST",
        "/api/westwall/checkin",
        {
            "firmwareVersion": FIRMWARE_VERSION,
            "wifiRssi": wifi.radio.ap_info.rssi if wifi.radio.ap_info else -99,
            "uptimeSeconds": int(time.monotonic() - started_at),
            "freeMemoryBytes": gc.mem_free(),
            "currentScreen": current_screen,
        },
    )


def acknowledge(command_id, command_status="acknowledged"):
    request_json(
        "POST",
        "/api/westwall/commands/ack",
        {"id": command_id, "status": command_status},
    )


def process_commands():
    payload = request_json("GET", "/api/westwall/commands/pending")
    for command in payload.get("commands", []):
        command_id = command.get("id", "")
        command_name = command.get("command", "refresh")
        try:
            if command_name in ("refresh", "reload", "show-now"):
                fetch_current()
            elif command_name in ("reboot", "restart"):
                acknowledge(command_id)
                time.sleep(1)
                microcontroller.reset()
            else:
                # Unknown commands are acknowledged so they do not remain queued.
                show_status("CMD " + command_name)
            acknowledge(command_id)
        except Exception:
            acknowledge(command_id, "failed")


pool = socketpool.SocketPool(wifi.radio)
session = adafruit_requests.Session(pool, ssl.create_default_context())

started = time.monotonic()
last_poll = -POLL_SECONDS
last_checkin = -CHECKIN_SECONDS
last_commands = -COMMAND_SECONDS
failure_count = 0

show_lines(["CONNECTING TO", "MATTHEWOS", "PLEASE WAIT"], "startup", "WESTWALL")

while True:
    now = time.monotonic()
    try:
        connect_wifi()

        if now - last_poll >= POLL_SECONDS:
            fetch_current()
            last_poll = now

        if now - last_checkin >= CHECKIN_SECONDS:
            send_checkin(started)
            last_checkin = now

        if now - last_commands >= COMMAND_SECONDS:
            process_commands()
            last_commands = now

        failure_count = 0
    except Exception as error:
        failure_count += 1
        print("WestWall network error:", repr(error))
        show_status("RETRYING " + str(failure_count), 0xFF3000)
        if failure_count >= 3:
            try:
                wifi.radio.stop_station()
            except Exception:
                pass
        time.sleep(min(5 * failure_count, 30))

    time.sleep(0.25)
