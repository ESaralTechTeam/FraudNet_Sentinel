from fastapi import APIRouter, HTTPException
from services.auth_service import login

router = APIRouter()


@router.post("/login")
def user_login(email: str, password: str):

    try:

        tokens = login(email, password)

        return {
            "access_token": tokens["AccessToken"],
            "id_token": tokens["IdToken"],
            "refresh_token": tokens["RefreshToken"]
        }

    except Exception as e:

        raise HTTPException(status_code=401, detail=str(e))