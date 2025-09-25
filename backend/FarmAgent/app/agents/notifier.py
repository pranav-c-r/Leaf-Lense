import os
from pathlib import Path
from dotenv import load_dotenv
import json
import subprocess
import shutil

# Load environment variables from backend root directory
backend_root = Path(__file__).parent.parent.parent.parent
load_dotenv(backend_root / '.env')
PERISKOPE_API_KEY = os.getenv("PERISKOPE_API_KEY")
PERISKOPE_PHONE_ID = os.getenv("PERISKOPE_PHONE_ID", "")

# Full path to npx.cmd (Windows). Auto-detect if possible.
NPX_PATH = shutil.which("npx") or "npx"
# Start MCP process once for the whole module
MCP_PROC = None
if not NPX_PATH or not os.path.exists(NPX_PATH):
    print(f"❌ ERROR: npx not found. Check Node.js installation or NPX_PATH ({NPX_PATH})")
else:
    try:
        MCP_PROC = subprocess.Popen(
            [NPX_PATH, "-y", "@periskope/whatsapp-mcp", "--transport", "stdio"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )
        print("✅ MCP process started successfully")
    except Exception as e:
        print(f"❌ Failed to start MCP process: {e}")
        MCP_PROC = None

def send_whatsapp_alert(phone_number: str, message: str) -> bool:
    """
    Send a WhatsApp message via Periskope MCP Server (stdio transport).
    - phone_number: recipient's WhatsApp number with country code (e.g., "+919876543210")
    - message: text content to send
    Returns True on success, False on failure.
    """

    if not PERISKOPE_API_KEY or not PERISKOPE_PHONE_ID:
        print("❌ ERROR: PERISKOPE_API_KEY or PERISKOPE_PHONE_ID missing in .env")
        return False

    if not MCP_PROC:
        print("❌ ERROR: MCP process not running. Start it manually or check NPX_PATH")
        return False

    # Clean phone number
    clean_phone = ''.join(filter(lambda x: x in '+0123456789', phone_number))
    if not clean_phone.startswith('+'):
        print(f"❌ ERROR: Phone number must include country code: {phone_number}")
        return False

    payload = {
        "type": "send-message",
        "phone_id": PERISKOPE_PHONE_ID,
        "to": clean_phone,
        "message": message,
        "api_key": PERISKOPE_API_KEY
    }

    try:
        # Send payload as JSON string
        payload_str = json.dumps(payload) + "\n"
        MCP_PROC.stdin.write(payload_str)
        MCP_PROC.stdin.flush()

        # Read response line (non-blocking, may timeout)
        stdout_line = MCP_PROC.stdout.readline().strip()
        if stdout_line:
            print(f"📤 WhatsApp sent to {clean_phone}")
            print(f"📨 MCP Response: {stdout_line}")
            return True
        else:
            print(f"❌ MCP did not respond for {clean_phone}")
            return False

    except Exception as e:
        print(f"❌ WhatsApp send failed for {clean_phone}: {e}")
        # Print MCP process stderr for debugging
        if MCP_PROC and MCP_PROC.stderr:
            error_output = MCP_PROC.stderr.read()
            print(f"MCP STDERR: {error_output}")
        return False
