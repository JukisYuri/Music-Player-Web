from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.apps import apps
import os
import tempfile
import torch


def get_whisper_model():
    try:
        return apps.get_app_config('speechToText').model
    except LookupError:
        return None


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
                return JsonResponse({"error": "Model chưa sẵn sàng."}, status=503)

            is_cuda = torch.cuda.is_available()

            result = model.transcribe(
                temp_audio_path,
                fp16=is_cuda,
                language='vi',
                initial_prompt="Tìm bài hát, mở nhạc, Sơn Tùng MTP, Đen Vâu, nhạc trẻ"
            )
            text_result = result['text'].strip()

            command_type = "search"
            keyword = text_result

            return JsonResponse({
                "status": "success",
                "text": text_result,
                "command": command_type,
                "keyword": keyword
            })

        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

        finally:
            if os.path.exists(temp_audio_path):
                os.remove(temp_audio_path)

    return JsonResponse({"status": "error", "message": "Invalid request"}, status=400)