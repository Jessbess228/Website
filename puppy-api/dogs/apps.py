import os

from django.apps import AppConfig


class DogsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "dogs"

    def ready(self) -> None:
        # Django's autoreloader runs ready() twice; only start in the child process.
        if os.environ.get("RUN_MAIN") != "true":
            return

        from dogs.scheduler import start_scheduler

        start_scheduler()
