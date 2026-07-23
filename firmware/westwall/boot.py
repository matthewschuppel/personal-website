"""WestWall storage policy.

Normal boot: CIRCUITPY is writable by the device for staged OTA updates.
Hold the UP button while resetting: recovery/USB-write mode.
"""

import board
import digitalio
import storage

recovery_button = digitalio.DigitalInOut(board.BUTTON_UP)
recovery_button.switch_to_input(pull=digitalio.Pull.UP)

# readonly applies to CircuitPython. Holding UP makes CircuitPython read-only
# and returns write access to the connected computer for manual recovery.
storage.remount("/", readonly=not recovery_button.value)
recovery_button.deinit()
