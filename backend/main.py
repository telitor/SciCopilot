import json
from io import BytesIO
from typing import Optional

from fastapi import Depends, FastAPI, File, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.llm_service import generate_reply
from services.supabase_service import get_supabase_client

app = FastAPI(
    title="SciCopilot Backend",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase = get_supabase_client()


class CreateConversationRequest(BaseModel):
    agent_id: str
    title: Optional[str] = "鏂扮殑瀵硅瘽"


class ChatRequest(BaseModel):
    conversation_id: str
    agent_id: str
    message: str


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    username: Optional[str] = None


def format_auth_user(user):
    metadata = getattr(user, "user_metadata", None) or {}
    email = getattr(user, "email", None) or metadata.get("email", "")
    username = (
        metadata.get("username")
        or metadata.get("name")
        or (email.split("@")[0] if email else "")
    )

    return {
        "id": getattr(user, "id", ""),
        "email": email,
        "username": username,
        "role": metadata.get("role", "user"),
        "created_at": getattr(user, "created_at", None),
    }


def parse_agent_report(raw_reply: str, fallback_title: str):
    def fallback_report():
        return {
            "title": fallback_title,
            "authors": "Unknown",
            "sections": [
                {
                    "title": "论文精读结果",
                    "content": raw_reply,
                    "citation": "[1]",
                }
            ],
        }

    try:
        cleaned = raw_reply.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[len("```json") :].strip()
        elif cleaned.startswith("```"):
            cleaned = cleaned[len("```") :].strip()

        if cleaned.endswith("```"):
            cleaned = cleaned[:-3].strip()

        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1 and end > start:
            json_text = cleaned[start : end + 1]
        else:
            json_text = cleaned

        report = json.loads(json_text)
        if not isinstance(report, dict):
            return fallback_report()

        sections = report.get("sections") or []
        if not isinstance(sections, list):
            sections = []

        normalized_sections = []
        for index, section in enumerate(sections, start=1):
            if not isinstance(section, dict):
                continue

            normalized_sections.append(
                {
                    "title": str(
                        section.get("title")
                        or section.get("heading")
                        or f"章节 {index}"
                    ),
                    "content": str(section.get("content") or ""),
                    "citation": str(section.get("citation") or f"[{index}]"),
                }
            )

        if not normalized_sections:
            return fallback_report()

        return {
            "title": str(report.get("title") or fallback_title),
            "authors": str(report.get("authors") or "Unknown"),
            "sections": normalized_sections,
        }
    except Exception:
        return fallback_report()


def extract_pdf_text(pdf_bytes: bytes, max_chars: int = 10000, max_pages: int = 5) -> str:
    try:
        from pypdf import PdfReader
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="PDF parser dependency missing: pypdf",
        )

    try:
        reader = PdfReader(BytesIO(pdf_bytes))
        text_parts = []

        for page_index, page in enumerate(reader.pages):
            if page_index >= max_pages:
                break

            page_text = page.extract_text() or ""
            if page_text.strip():
                text_parts.append(page_text)

            if sum(len(part) for part in text_parts) >= max_chars:
                break

        extracted_text = "\n\n".join(text_parts).strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read PDF: {str(e)}")

    if not extracted_text:
        raise HTTPException(
            status_code=400,
            detail="Unable to extract text from PDF. It may be a scanned PDF.",
        )

    return extracted_text[:max_chars]


def get_current_user(authorization: str = Header(None)):
    """
    浠庤姹傚ご Authorization 涓鍙?token锛?

    Authorization: Bearer 鐢ㄦ埛鐨?access_token

    鐒跺悗璋冪敤 Supabase Auth 楠岃瘉 token锛屾嬁鍒板綋鍓嶇敤鎴枫€?
    """

    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization format")

    token = authorization.replace("Bearer ", "").strip()

    try:
        user_response = supabase.auth.get_user(token)
        user = user_response.user

        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")

        return user

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@app.get("/")
def health_check():
    return {
        "status": "ok",
        "service": "SciCopilot Backend",
        "version": "v0.1",
    }


@app.post("/auth/login")
def login(payload: LoginRequest):
    """
    Login with Supabase Auth and return the current user plus access token.
    """

    try:
        auth_response = supabase.auth.sign_in_with_password(
            {
                "email": payload.email,
                "password": payload.password,
            }
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Login failed: {str(e)}")

    user = getattr(auth_response, "user", None)
    session = getattr(auth_response, "session", None)
    token = getattr(session, "access_token", None) if session else None

    if not user or not token:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "user": format_auth_user(user),
        "token": token,
    }


@app.post("/auth/register")
def register(payload: RegisterRequest):
    """
    Register a new user with Supabase Auth.
    """

    sign_up_payload = {
        "email": payload.email,
        "password": payload.password,
    }

    if payload.username:
        sign_up_payload["options"] = {
            "data": {
                "username": payload.username,
                "role": "user",
            }
        }

    try:
        auth_response = supabase.auth.sign_up(sign_up_payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Register failed: {str(e)}")

    user = getattr(auth_response, "user", None)
    session = getattr(auth_response, "session", None)
    token = getattr(session, "access_token", None) if session else None

    if not user:
        raise HTTPException(status_code=400, detail="Register failed: missing user")

    response = {
        "user": format_auth_user(user),
        "token": token,
    }

    if not token:
        response["message"] = (
            "Register succeeded, but no access token was returned. "
            "Email confirmation may be required before login."
        )

    return response


@app.get("/users/me")
def get_me(user=Depends(get_current_user)):
    """
    Return the currently authenticated user.
    """

    return format_auth_user(user)


@app.get("/agents")
def get_agents():
    """
    鑾峰彇鍏紑鏅鸿兘浣撳垪琛ㄣ€?

    绗竴鐗堝簲璇ヨ繑鍥烇細
    - 璁烘枃绮捐鍔╂墜
    - 浠ｇ爜瑙ｉ噴鍔╂墜
    - 椤圭洰瑙勫垝鍔╂墜
    """

    result = (
        supabase.table("agents")
        .select("id,name,description,category,is_public,created_at")
        .eq("is_public", True)
        .execute()
    )

    return result.data


@app.post("/papers/analyze")
async def analyze_paper(
    file: UploadFile = File(...),
    user=Depends(get_current_user),
):
    """
    Upload a PDF, extract text, and ask the paper-reading agent for a report.
    """

    filename = file.filename or "uploaded.pdf"
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    print(f"[papers/analyze] start parsing PDF: {filename}")
    pdf_bytes = await file.read()
    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="Uploaded PDF is empty")

    paper_text = extract_pdf_text(pdf_bytes)
    print(f"[papers/analyze] extracted text length: {len(paper_text)}")
    fallback_title = filename.rsplit(".", 1)[0]

    prompt = f"""
Return valid JSON only. Do not use Markdown code fences. Do not add ```json. Do not add any extra explanation.
If title is unknown, use "{fallback_title}". If authors are unknown, use "Unknown".
Each section content must be brief, about 80-150 Chinese characters.
Required JSON shape:
{{
  "title": "paper title",
  "authors": "authors or Unknown",
  "sections": [
    {{"title": "研究背景与动机", "content": "brief analysis", "citation": "[1]"}},
    {{"title": "核心方法", "content": "brief analysis", "citation": "[2]"}},
    {{"title": "实验结果", "content": "brief analysis", "citation": "[3]"}},
    {{"title": "关键结论", "content": "brief analysis", "citation": "[4]"}}
  ]
}}

Paper text excerpt:
{paper_text}
""".strip()

    try:
        print("[papers/analyze] start calling paper-reading agent")
        raw_reply = generate_reply(
            system_prompt="You are a paper reading assistant. Return concise valid JSON only.",
            user_message=prompt,
            agent_category="paper-reading",
            user_id=user.id,
        )
        print("[papers/analyze] paper-reading agent returned successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Paper analysis failed: {str(e)}")

    return parse_agent_report(raw_reply, fallback_title)


@app.post("/conversations")
def create_conversation(
    payload: CreateConversationRequest,
    user=Depends(get_current_user),
):
    """
    鍒涘缓涓€鏉℃柊瀵硅瘽銆?

    鍓嶇鐐瑰嚮鏌愪釜鏅鸿兘浣撳悗锛岃皟鐢ㄨ繖涓帴鍙ｅ垱寤?conversation銆?
    """

    # 鍏堟鏌?agent 鏄惁瀛樺湪
    agent_result = (
        supabase.table("agents")
        .select("id,name")
        .eq("id", payload.agent_id)
        .eq("is_public", True)
        .execute()
    )

    if not agent_result.data:
        raise HTTPException(status_code=404, detail="Agent not found")

    data = {
        "user_id": user.id,
        "agent_id": payload.agent_id,
        "title": payload.title or "鏂扮殑瀵硅瘽",
    }

    result = supabase.table("conversations").insert(data).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create conversation")

    return result.data[0]


@app.get("/conversations")
def list_conversations(user=Depends(get_current_user)):
    """
    鑾峰彇褰撳墠鐢ㄦ埛鑷繁鐨勫巻鍙插璇濄€?
    """

    result = (
        supabase.table("conversations")
        .select("id,agent_id,title,created_at,updated_at")
        .eq("user_id", user.id)
        .order("updated_at", desc=True)
        .execute()
    )

    return result.data


@app.get("/conversations/{conversation_id}/messages")
def list_messages(
    conversation_id: str,
    user=Depends(get_current_user),
):
    """
    鑾峰彇鏌愪釜瀵硅瘽閲岀殑娑堟伅銆?

    蹇呴』鍏堟鏌ヨ繖涓?conversation 鏄惁灞炰簬褰撳墠鐢ㄦ埛銆?
    """

    conversation = (
        supabase.table("conversations")
        .select("id,user_id")
        .eq("id", conversation_id)
        .eq("user_id", user.id)
        .execute()
    )

    if not conversation.data:
        raise HTTPException(status_code=404, detail="Conversation not found")

    result = (
        supabase.table("messages")
        .select("id,role,content,created_at")
        .eq("conversation_id", conversation_id)
        .eq("user_id", user.id)
        .order("created_at")
        .execute()
    )

    return result.data


@app.post("/chat")
def chat(
    payload: ChatRequest,
    user=Depends(get_current_user),
):
    """
    鍙戦€佹秷鎭苟鑾峰彇 AI 鍥炲銆?

    鏍稿績娴佺▼锛?
    1. 妫€鏌?conversation 鏄惁灞炰簬褰撳墠鐢ㄦ埛
    2. 妫€鏌?agent 鏄惁瀛樺湪
    3. 淇濆瓨鐢ㄦ埛娑堟伅
    4. 璋冪敤澶фā鍨嬬敓鎴愬洖澶?
    5. 淇濆瓨 AI 鍥炲
    6. 鏇存柊 conversation 鏃堕棿
    7. 杩斿洖 AI 鍥炲
    """

    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # 1. 妫€鏌?conversation 鏄惁灞炰簬褰撳墠鐢ㄦ埛
    conversation = (
        supabase.table("conversations")
        .select("id,user_id,agent_id,title")
        .eq("id", payload.conversation_id)
        .eq("user_id", user.id)
        .execute()
    )

    if not conversation.data:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if conversation.data[0]["agent_id"] != payload.agent_id:
        raise HTTPException(
            status_code=400,
            detail="Conversation agent does not match the requested agent",
        )

    # 2. 妫€鏌?agent 鏄惁瀛樺湪
    agent = (
        supabase.table("agents")
        .select("id,name,system_prompt,category")
        .eq("id", payload.agent_id)
        .eq("is_public", True)
        .execute()
    )
    if not agent.data:
        raise HTTPException(status_code=404, detail="Agent not found")

    system_prompt = agent.data[0]["system_prompt"]

    # 3. 淇濆瓨鐢ㄦ埛娑堟伅
    user_message_result = supabase.table("messages").insert(
        {
            "conversation_id": payload.conversation_id,
            "user_id": user.id,
            "role": "user",
            "content": payload.message,
        }
    ).execute()

    if not user_message_result.data:
        raise HTTPException(status_code=500, detail="Failed to save user message")

    # 4. 璋冪敤澶фā鍨嬫垨涓存椂娴嬭瘯鍥炲
    try:
        reply = generate_reply(
            system_prompt=system_prompt,
            user_message=payload.message,
            agent_category=agent.data[0].get("category", ""),
            user_id=user.id,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM call failed: {str(e)}")

    # 5. 淇濆瓨 AI 鍥炲
    assistant_message_result = supabase.table("messages").insert(
        {
            "conversation_id": payload.conversation_id,
            "user_id": user.id,
            "role": "assistant",
            "content": reply,
        }
    ).execute()

    if not assistant_message_result.data:
        raise HTTPException(status_code=500, detail="Failed to save assistant message")

    # 6. 鏇存柊 conversation
    # 杩欓噷浼氳Е鍙戜綘鍓嶉潰鍒涘缓鐨?updated_at trigger
    new_title = payload.message[:30]

    supabase.table("conversations").update(
        {
            "title": new_title,
        }
    ).eq("id", payload.conversation_id).eq("user_id", user.id).execute()

    # 7. 杩斿洖缁撴灉
    return {
        "reply": reply,
    }

