#!/usr/bin/env python3
"""
Hotel Matching Visualization Server Starter
"""

import uvicorn
from backend import app

if __name__ == "__main__":
    print("🚀 Hotel Matching Visualization Server 시작 중...")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
