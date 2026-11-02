"""Background interval fetcher for The Dog API."""

from __future__ import annotations

import logging
import threading

from django.conf import settings

logger = logging.getLogger(__name__)

_thread: threading.Thread | None = None
_stop = threading.Event()


def _loop() -> None:
    from dogs.services import fetch_and_upsert

    interval = max(30, int(getattr(settings, "FETCH_INTERVAL_SECONDS", 3600)))
    logger.info("Puppy fetch scheduler started (interval=%ss)", interval)

    # Immediate first fetch so the UI is not empty on boot.
    try:
        fetch_and_upsert()
    except Exception:
        logger.exception("Initial Dog API fetch failed")

    while not _stop.wait(interval):
        try:
            fetch_and_upsert()
        except Exception:
            logger.exception("Scheduled Dog API fetch failed")


def start_scheduler() -> None:
    """Start the daemon fetch loop once (idempotent)."""
    global _thread

    if not getattr(settings, "ENABLE_FETCH_SCHEDULER", True):
        logger.info("Fetch scheduler disabled (ENABLE_FETCH_SCHEDULER=false)")
        return

    if _thread is not None and _thread.is_alive():
        return

    _stop.clear()
    _thread = threading.Thread(target=_loop, name="puppy-fetch-scheduler", daemon=True)
    _thread.start()


def stop_scheduler() -> None:
    _stop.set()
