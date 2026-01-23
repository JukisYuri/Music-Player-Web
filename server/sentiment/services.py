import torch
import torch.nn as nn
import pickle
import os

import re
import string
from django.conf import settings
from underthesea import text_normalize, word_tokenize


# --- 1. ĐỊNH NGHĨA MODEL (Giống hệt cấu trúc Train) ---
class SentimentLSTM(nn.Module):
    def __init__(self, vocab_size, embedding_dim, hidden_dim, output_dim):
        super(SentimentLSTM, self).__init__()
        self.embedding = nn.Embedding(vocab_size, embedding_dim, padding_idx=0)
        # batch_first=True: input shape = (batch, seq_len, features)
        self.lstm = nn.LSTM(embedding_dim, hidden_dim, batch_first=True, bidirectional=True)
        self.dropout = nn.Dropout(0.4)
        self.fc = nn.Linear(hidden_dim * 2, output_dim)

    def forward(self, x):
        embeds = self.embedding(x)
        lstm_out, _ = self.lstm(embeds)

        # Global Max Pooling
        lstm_out = lstm_out.permute(0, 2, 1)
        max_pool = torch.nn.functional.max_pool1d(lstm_out, kernel_size=lstm_out.shape[2]).squeeze(2)

        dropped = self.dropout(max_pool)
        out = self.fc(dropped)
        return out


# --- 2. CLASS DỰ ĐOÁN ---
class SentimentPredictor:
    def __init__(self):
        self.model = None
        self.vocab = None
        self.device = torch.device('cuda')

        self.emoji_pattern = re.compile("["
                                        u"\U0001F600-\U0001F64F"
                                        u"\U0001F300-\U0001F5FF"
                                        u"\U0001F680-\U0001F6FF"
                                        u"\U0001F1E0-\U0001F1FF"
                                        u"\U00002702-\U000027B0"
                                        u"\U000024C2-\U0001F251"
                                        u"\U0001f926-\U0001f937"
                                        u"\U00010000-\U0010ffff"
                                        u"\u200d"
                                        u"\u2640-\u2642"
                                        u"\u2600-\u2B55"
                                        u"\u23cf"
                                        u"\u23e9"
                                        u"\u231a"
                                        u"\u3030"
                                        u"\ufe0f"
                                        "]+", flags=re.UNICODE)

        # [QUAN TRỌNG] Cập nhật theo thông số của bạn
        self.max_len = 100  # MAX_SEQ_LENGTH = 100

        # Đường dẫn file
        base_path = os.path.dirname(os.path.abspath(__file__))
        self.model_path = os.path.join(base_path, 'ml_models', 'LSTM_PyTorch_best.pth')
        self.vocab_path = os.path.join(base_path, 'ml_models', 'vocab.pkl')

    def clean_text(self, text):
        if not isinstance(text, str):
            return ""

        text = text.lower()

        # 1. Xóa Emoji
        text = re.sub(self.emoji_pattern, " ", text)

        # 2. Xóa ký tự lặp (vd: hayyy -> hay)
        text = re.sub(r'([a-z]+?)\1+', r'\1', text)

        # 3. Xử lý dấu câu dính liền
        text = re.sub(r"(\w)\s*([" + re.escape(string.punctuation) + r"])\s*(\w)", r"\1 \2 \3", text)
        text = re.sub(r"(\w)\s*([" + string.punctuation + "])", r"\1 \2", text)
        text = re.sub(f"([{string.punctuation}])([{string.punctuation}])+", r"\1", text)

        text = text.strip()

        # 4. Xóa dấu câu ở đầu/cuối
        while text.endswith(tuple(string.punctuation + string.whitespace)):
            text = text[:-1]
        while text.startswith(tuple(string.punctuation + string.whitespace)):
            text = text[1:]

        # 5. Xóa toàn bộ dấu câu còn lại
        text = text.translate(str.maketrans('', '', string.punctuation))

        text = re.sub(r"\s+", " ", text)

        # 6. Chuẩn hóa & Tách từ (Underthesea)
        try:
            text = text_normalize(text)
            text = word_tokenize(text, format="text")
        except NameError:
            # Fallback nếu chưa cài underthesea (tránh crash server)
            pass

        return text

    def load_model(self):
        if self.model is not None:
            return

        print(f"--> [AI] Loading Model: {self.model_path}")
        try:
            # 1. Load Vocab
            with open(self.vocab_path, 'rb') as f:
                self.vocab = pickle.load(f)

            # 2. Config (Khớp 100% thông số Train)
            VOCAB_SIZE = len(self.vocab)
            EMBEDDING_DIM = 128
            HIDDEN_DIM = 128
            OUTPUT_DIM = 3  # [QUAN TRỌNG] 3 lớp (Neg, Neu, Pos)

            # 3. Init Model
            self.model = SentimentLSTM(VOCAB_SIZE, EMBEDDING_DIM, HIDDEN_DIM, OUTPUT_DIM)

            # 4. Load Weights
            state_dict = torch.load(self.model_path, map_location=self.device)
            self.model.load_state_dict(state_dict)
            self.model.to(self.device)

            # [CỰC KỲ QUAN TRỌNG] Chuyển sang chế độ đánh giá để tắt Dropout
            # Giúp kết quả cố định, không bị nhảy lung tung
            self.model.eval()

            print("--> [AI] Model Loaded & Eval Mode Activated!")

        except Exception as e:
            print(f"--> [ERROR] Load Model Failed: {e}")

    def preprocess(self, text):
        # BƯỚC 1: CLEAN TEXT (Mới thêm vào)
        # Text sẽ được làm sạch và tách từ (vd: "học sinh" -> "học_sinh")
        cleaned_text = self.clean_text(text)

        # BƯỚC 2: Tách thành list tokens
        tokens = cleaned_text.split()

        # BƯỚC 3: Map sang Index
        indexes = [self.vocab.get(token, 1) for token in tokens]

        # BƯỚC 4: Padding
        if len(indexes) < self.max_len:
            indexes = indexes + [0] * (self.max_len - len(indexes))
        else:
            indexes = indexes[:self.max_len]

        return torch.tensor(indexes, dtype=torch.long).unsqueeze(0).to(self.device)

    def predict(self, text):
        if self.model is None:
            self.load_model()

        if not text: return "NEUTRAL", 0.0

        try:
            tensor_input = self.preprocess(text)

            with torch.no_grad():
                output = self.model(tensor_input)
                probs = torch.nn.functional.softmax(output, dim=1)
                _, predicted = torch.max(output, 1)

            idx = predicted.item()
            confidence = probs[0][idx].item()

            # [QUAN TRỌNG] Map Output 3 Lớp
            # Giả định mapping chuẩn: 0=Negative, 1=Neutral, 2=Positive
            # Nếu lúc train label của bạn khác thứ tự này thì sửa lại ở đây
            if idx == 0:
                return 'NEGATIVE', confidence
            elif idx == 1:
                return 'NEUTRAL', confidence
            elif idx == 2:
                return 'POSITIVE', confidence

            return 'NEUTRAL', confidence

        except Exception as e:
            print(f"--> [ERROR] Prediction Failed: {e}")
            return "NEUTRAL", 0.0