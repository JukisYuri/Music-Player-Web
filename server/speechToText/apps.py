from django.apps import AppConfig
import whisper
import os
import torch


class SpeechtotextConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'speechToText'
    model = None

    def ready(self):
        if os.environ.get('RUN_MAIN', None) != 'true':
            pass

        try:
            device = "cuda" if torch.cuda.is_available() else "cpu"
            self.model = whisper.load_model("medium", device=device)

            # print(device)
            print("--- Whisper Model đã sẵn sàng! ---")
        except Exception as e:
            print(f"Không thể tải model: {e}")