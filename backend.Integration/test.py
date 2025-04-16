import asyncio
import websockets

async def echo(websocket, path):
    async for message in websocket:
        await websocket.send(f"Received: {message}")

async def start_server():
    server = await websockets.serve(echo, "localhost", 8765)
    print("WebSocket Server started on ws://localhost:8765")
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(start_server())