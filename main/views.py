from django.shortcuts import render
from django.http import HttpRequest
from django.views.decorators.csrf import csrf_exempt
from django_ratelimit.decorators import ratelimit
import subprocess
import asyncio

# This function executes the JAR file asynchronously
async def run_jar(input_text: str, is_debug: bool) -> str:
    process = await asyncio.create_subprocess_exec(
        "java", "-jar", "TP2.jar", f"{str(is_debug).lower()}",
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    stdout, stderr = await process.communicate(input=input_text.encode())
    if stderr:
        return f"Error: {stderr.decode()}"
    return stdout.decode()

@ratelimit(key='ip', rate='20/m', method='POST', block=True)
@ratelimit(key='ip', rate='100/m', method='GET', block=True)
@csrf_exempt
def execute_jar(request: HttpRequest):
    if request.method == "GET":
        return render(request, "main.html")

    if request.method == "POST":
        try:
            input_text = request.POST.get("text", "")
            isDebug = request.GET.get('debug') == 'true'
            if not input_text:
                return render(request, "main.html", {"error": "No input text provided"})

            # Run the async function synchronously
            result = asyncio.run(run_jar(input_text, isDebug))
            
            if result.startswith("Error:"):
                return render(request, "main.html", {"error": result})

            return render(request, "main.html", {"input_text": input_text, "output": result})

        except Exception as e:
            return render(request, "main.html", {"error": "An error occurred", "details": str(e)})

    return render(request, "main.html", {"error": "Invalid HTTP method. Use GET or POST."})
