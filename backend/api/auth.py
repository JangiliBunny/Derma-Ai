from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from models.user import UserCreate, UserInDB, Token
from services.auth_utils import verify_password, get_password_hash, create_access_token
from database import get_database
from datetime import timedelta
from typing import Annotated
import uuid

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")

@router.post("/register", response_model=UserInDB)
async def register_user(user: UserCreate):
    db = get_database()
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    user_dict = user.dict()
    user_dict.pop("password")
    
    db_user = UserInDB(
        **user_dict,
        id=str(uuid.uuid4())
    )
    
    try:
        user_doc = db_user.dict()
        user_doc["hashed_password"] = hashed_password
        await db.users.insert_one(user_doc)
        return db_user
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    db = get_database()
    user = await db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=60*24*7)
    access_token = create_access_token(
        data={"sub": user["email"], "role": user.get("role", "patient")}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    from jose import JWTError, jwt
    from services.auth_utils import SECRET_KEY, ALGORITHM
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    db = get_database()
    user = await db.users.find_one({"email": email})
    if user is None:
        raise credentials_exception
    return UserInDB(**user)

@router.get("/me", response_model=UserInDB)
async def get_my_profile(current_user: UserInDB = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserInDB)
async def update_my_profile(update_data: dict, current_user: UserInDB = Depends(get_current_user)):
    db = get_database()
    
    # Filter only allowed fields (exclude id, email, password, role overrides, etc)
    allowed_fields = ["full_name", "mobile_number", "age", "gender", "medical_history", "specialization", "experience", "hospital_name"]
    filtered_data = {k: v for k, v in update_data.items() if k in allowed_fields}
    
    if filtered_data:
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": filtered_data}
        )
        
    # Fetch updated user
    updated_user = await db.users.find_one({"id": current_user.id})
    return UserInDB(**updated_user)
