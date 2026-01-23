#sentiment/apps.py
from django.apps import AppConfig
import os
from .services import SentimentPredictor, SentimentLSTM


class SentimentConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'sentiment'

    # Biến static lưu predictor
    predictor = None
    model = None
    def ready(self):
        # Kiểm tra để tránh load 2 lần trong chế độ Debug
        if os.environ.get('RUN_MAIN', None) != 'true':
            return

        if SentimentConfig.predictor is None:
            SentimentConfig.predictor = SentimentPredictor()
            SentimentConfig.predictor.load_model()
