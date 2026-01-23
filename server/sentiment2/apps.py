from django.apps import AppConfig

class Sentiment2Config(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'sentiment2'
    predictor = None

    def ready(self):
        # Import predictor bên trong ready để tránh lỗi AppRegistryNotReady
        from .predictor import PhoBERTMusicPredictor
        # Gán instance vào class Config để truy cập từ mọi nơi
        self.predictor = PhoBERTMusicPredictor()

