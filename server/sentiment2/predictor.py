import torch
import os
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from pyvi import ViTokenizer
from django.conf import settings


class PhoBERTMusicPredictor:
    def __init__(self):
        # Đường dẫn tới thư mục chứa model sau khi fine-tune
        model_path = os.path.join(settings.MEDIA_ROOT, "music_phobert_v1")

        if not os.path.exists(model_path):
            raise OSError(f"Khong tim thay model tai: {model_path}")
        else: print(f"TIM THAY MODEL: {model_path}")
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_path)
        self.model.eval()

        # Mapping nhãn theo dữ liệu đã train
        self.labels = ['NEGATIVE', 'NEUTRAL', 'POSITIVE']

    def predict(self, text):
        # Tách từ tiếng Việt
        text_segmented = ViTokenizer.tokenize(text)

        inputs = self.tokenizer(
            text_segmented,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=256
        )

        with torch.no_grad():
            outputs = self.model(**inputs)
            probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)
            confidence, target_class = torch.max(probabilities, dim=-1)

        return self.labels[target_class.item()], confidence.item()