from __future__ import annotations

import json
import os
import subprocess
from pathlib import Path

from .models import LocationPoint


def _workspace_root() -> Path:
    return Path(__file__).resolve().parents[3]


def run_location_chat_agent(
    *,
    user_message: str,
    message_history: list[dict[str, str]],
) -> str:
    workspace_root = _workspace_root()
    frontend_dir = workspace_root / "datavault-app-react"
    agent_script_path = frontend_dir / "scripts" / "location-chat-agent.mjs"
    location_history = list(
        LocationPoint.objects.values(
            "label",
            "latitude",
            "longitude",
            "recorded_at",
        )
    )
    payload = {
        "userMessage": user_message,
        "messageHistory": message_history,
        "locationHistory": [
            {
                **point,
                "recorded_at": point["recorded_at"].isoformat(),
            }
            for point in location_history
        ],
    }
    result = subprocess.run(
        ["node", str(agent_script_path)],
        cwd=frontend_dir,
        check=True,
        capture_output=True,
        text=True,
        input=json.dumps(payload),
        env=os.environ.copy(),
    )
    parsed = json.loads(result.stdout)
    return parsed["response"]
