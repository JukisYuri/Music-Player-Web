from django.contrib import admin
from django.apps import apps


# Đây là Action dùng chung, bạn có thể gọi nó ở bất kỳ ModelAdmin nào
def analyze_phobert_sentiment(modeladmin, request, queryset):
    # Lấy instance predictor đã nạp sẵn trong memory
    try:
        sentiment_config = apps.get_app_config('sentiment2')
        predictor = sentiment_config.predictor
    except Exception as e:
        modeladmin.message_user(request, f"Lỗi nạp Model: {e}", level='error')
        return

    updated_count = 0
    for obj in queryset:
        # Giả sử Model của bạn có trường 'content' (nội dung bình luận)
        # và trường 'sentiment', 'confidence_score' để lưu kết quả
        if hasattr(obj, 'content'):
            label, score = predictor.predict(obj.content)
            obj.sentiment = label
            obj.confidence_score = score
            obj.save()
            updated_count += 1

    modeladmin.message_user(request, f"Đã phân tích xong {updated_count} bản ghi bằng PhoBERT.")


analyze_phobert_sentiment.short_description = "Phân loại cảm xúc (PhoBERT)"