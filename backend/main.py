import os
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException

load_dotenv(".env.local")

app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "https://shift-ready-a3.vercel.app"],
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)
@app.get("/health")
def health():
    configured = bool(
        os.getenv("VITE_SUPABASE_URL")
        and os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY")
    )
    return {"status": "ok", "database_configured": configured} 

@app.get("/shifts")
async def get_shifts(authorization: str = Header(default="")):
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Please sign in")

    url = os.getenv("VITE_SUPABASE_URL")
    key = os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY")
    if not url or not key:
        raise HTTPException(500, "Backend is not configured")

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                f"{url.rstrip('/')}/rest/v1/shift_records",
                headers={"apikey": key, "Authorization": authorization},
                params={
                    "select": "id,facility,shift_date,shift_start,shift_end,hourly_pay,created_at",
                    "order": "created_at.desc",
                },
            )
    except httpx.HTTPError:
        raise HTTPException(502, "Database unavailable")

    if response.status_code in (401, 403):
        raise HTTPException(401, "Please sign in again")
    if response.is_error:
        raise HTTPException(502, "Could not load shifts")

    return response.json()
@app.post("/shifts", status_code=201)
async def create_shift(shift: dict, authorization: str = Header(default="")):
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Please sign in")

    url = os.getenv("VITE_SUPABASE_URL")
    key = os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY")
    if not url or not key:
        raise HTTPException(500, "Backend is not configured")

    headers = {"apikey": key, "Authorization": authorization}
    fields = (
        "facility", "shift_date", "shift_start", "shift_end",
        "hourly_pay", "travel_method", "max_travel_time",
        "return_travel_time", "return_travel_cost", "docs_ready",
        "uniform_ready", "route_planned", "arrive_early",
    )

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            user_response = await client.get(
                f"{url.rstrip('/')}/auth/v1/user", headers=headers
            )
            if user_response.status_code != 200:
                raise HTTPException(401, "Please sign in again")

            record = {field: shift[field] for field in fields if field in shift}
            record["user_id"] = user_response.json()["id"]

            response = await client.post(
                f"{url.rstrip('/')}/rest/v1/shift_records",
                headers={**headers, "Prefer": "return=representation"},
                json=record,
            )
    except httpx.HTTPError:
        raise HTTPException(502, "Database unavailable")

    if response.is_error:
        raise HTTPException(400, "Could not save shift")

    return response.json()[0] 