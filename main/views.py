import subprocess
import asyncio
from django.shortcuts import render
from django.http import HttpRequest
from django.views.decorators.csrf import csrf_exempt

# This function executes the JAR file asynchronously
async def run_jar(input_text: str, is_debug: bool) -> str:
    # Create the subprocess and pass the input through stdin
    process = await asyncio.create_subprocess_exec(
        "java", "-jar", "TP2.jar", f"{str(is_debug).lower()}",
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    # Write the input text to stdin and await the result
    stdout, stderr = await process.communicate(input=input_text.encode())

    # Check for errors in stderr
    if stderr:
        return f"Error: {stderr.decode()}"

    return stdout.decode()

@csrf_exempt
async def execute_jar(request: HttpRequest):
    if request.method == "GET":
        # Render the form template for input
        return render(request, "main.html")

    if request.method == "POST":
        try:
            # Get the text input from the form
            input_text = request.POST.get("text", "")
            isDebug = request.GET.get('debug') == 'true'
            if not input_text:
                return render(request, "main.html", {"error": "No input text provided"})

            print(input_text)

            # Call the async function to run the JAR file
            result = await run_jar(input_text, isDebug)

            # Render the result in the template
            return render(request, "main.html", {"input_text": input_text, "output": result})

        except Exception as e:
            # Render the error in the template
            return render(request, "main.html", {"error": "An error occurred", "details": str(e)})

    return render(request, "main.html", {"error": "Invalid HTTP method. Use GET or POST."})
