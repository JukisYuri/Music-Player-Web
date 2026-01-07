from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.apps import apps
import os
import tempfile

def get_whisper_model():
    return apps.get_app_config('speechToText').model


@csrf_exempt
def voice_command_view(request):
    if request.method == 'POST' and request.FILES.get('audio_file'):
        audio_file = request.FILES['audio_file']

        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
            for chunk in audio_file.chunks():
                temp_audio.write(chunk)
            temp_audio_path = temp_audio.name

        try:
            model = get_whisper_model()

            if model is None:
                return JsonResponse({"error": "Model chưa sẵn sàng, vui lòng thử lại sau vài giây."}, status=503)

            result = model.transcribe(
                temp_audio_path,
                fp16=False,
                language='vi',
                initial_prompt="Mở nhạc, Sơn Tùng MTP, Đen Vâu, bài hát"
            )
            text_result = result['text'].strip()

            command_type = "search"
            keyword = text_result

            lower_text = text_result.lower()
            if "bật bài" in lower_text or "mở bài" in lower_text:
                command_type = "play"
                keyword = lower_text.replace("bật bài", "").replace("mở bài", "").strip()
            elif "dừng" in lower_text or "tắt" in lower_text:
                command_type = "pause"

            return JsonResponse({
                "status": "success",
                "text": text_result,
                "command": command_type,
                "keyword": keyword
            })

        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

        finally:
            if os.path.exists(temp_audio_path):
                os.remove(temp_audio_path)

    return JsonResponse({"status": "error", "message": "Invalid request"}, status=400)