from django.shortcuts import render
from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django_ratelimit.decorators import ratelimit
import subprocess
import asyncio
import time
import re

from main.models import Log

# This function executes the JAR file asynchronously
async def run_jar(input_text: str, is_debug: bool) -> str:
    process = await asyncio.create_subprocess_exec(
        "java", "-jar", "TP3.jar", f"{str(is_debug).lower()}",
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    stdout, stderr = await process.communicate(input=input_text.encode())
    if stderr:
        return f"Error: {stderr.decode()}"
    return stdout.decode()

def sanitize_text(text):
    """
    Removes unwanted or harmful characters from the text.
    """

    # Remove potentially malicious content (e.g., scripts)
    sanitized_text = re.sub(r'<script.*?>.*?</script>', '', text, flags=re.IGNORECASE)

    # Ensure no HTML tags remain
    sanitized_text = re.sub(r'<.*?>', '', sanitized_text)

    return sanitized_text

def get_client_ip(request):
    """
    Retrieves the client's public IP address.
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

@ratelimit(key='ip', rate='20/m', method='POST', block=True)
@ratelimit(key='ip', rate='100/m', method='GET', block=True)
@csrf_exempt
def execute_jar(request: HttpRequest):
    if request.method == "GET":
        return render(request, "main.html")

    if request.method == "POST":
        try:
            # Create new Log
            input_text = request.POST.get("text", "")
            input_text = sanitize_text(input_text)
            
            Log.objects.create(
                ip = get_client_ip(request),
                user_agent=request.META.get("HTTP_USER_AGENT"),
                query=input_text[:200],
            )
            
            isDebug = request.GET.get('debug') == 'true'
            
            if len(input_text) > 10000 and isDebug:
                return render(request, "main.html", {"error": "Bro mau buat website gw down bjir"})
            
            if not input_text:
                return render(request, "main.html", {"error": "No input text provided"})

            # Measure the execution time
            start_time = time.time()
            # Run the async function synchronously
            result = asyncio.run(run_jar(input_text, isDebug))
            end_time = time.time()
            execution_time = round(end_time - start_time, 3)
            
            if result.startswith("Error:"):
                return render(request, "main.html", {"error": result})

            return render(request, "main.html", {"input_text": input_text, "output": result, "time": execution_time})

        except Exception as e:
            return render(request, "main.html", {"error": "An error occurred", "details": str(e)})

    return render(request, "main.html", {"error": "Invalid HTTP method. Use GET or POST."})