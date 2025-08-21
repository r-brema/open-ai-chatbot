from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse  
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize OpenAI client
openai = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

app = FastAPI()

# Allow CORS so React frontend can communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chat_log = [
    {
        "role": "system",
        "content": (
            "You are MedBot, a helpful healthcare assistant. "
            "You can understand and respond in English and French. "
            "Reply in the same language as the user input. "
            "Always give short and accurate response"
            
        ),
    }
]
# , general medical information and remind users "
            # "that responses are not a substitute for professional medical advice. make the response short"

# Normal post call
# @app.post("/askAI")
# async def ask_ai(request: Request):
#     data = await request.json()
#     user_input = data.get("query", "")

#     chat_log.append({"role": "user", "content": user_input})

#     response = openai.chat.completions.create(
#         model="gpt-4",
#         messages=chat_log,
#         temperature=0.6,
#     )

#     ai_response = response.choices[0].message.content
#     chat_log.append({"role": "assistant", "content": ai_response})

#     return {"response": ai_response}

# test websocket
@app.websocket("/tws")
async def ws_test(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_text("Hello from FastAPI!")
    await websocket.close()

# websocket call
@app.websocket("/askAI")
async def ask_ai(websocket: WebSocket):
    """
    chat endpoint for React Chatify frontend
    """
    await websocket.accept()

    while True:
        try:
            # Receive user message from frontend
            user_input = await websocket.receive_text()
            chat_log.append({"role": "user", "content": user_input})

            # Send streamed AI response
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=chat_log,
                temperature=0.6,
                stream=True,
            )

            ai_response = ""
            try:
                for chunk in response:
                    delta = chunk.choices[0].delta.content
                    if delta is not None:
                        ai_response += delta
                        await websocket.send_text(delta)
                
                # 👇 Final marker to tell client streaming is complete
                await websocket.send_text("[END]")
            except Exception as e:
                # Fallback to human agent
                await websocket.send_text(
                    "[MedBot] Sorry, I couldn't process that. Please ask a human assistant."
                )
                break
            
            # Append AI response to chat log
            chat_log.append({"role": "assistant", "content": ai_response})
        except WebSocketDisconnect:
            print("Client disconnected")
        except Exception as e:
            await websocket.send_text(f"[MedBot Error]: {str(e)}")
            break

# fallback (catch-all) handler for invalid API calls
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={"error": "Invalid API endpoint", "path": request.url.path},
    )
# generic exception handler (for errors like 500):
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": "Something went wrong. Please try again later."},
    )
