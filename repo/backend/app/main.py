from datetime import timedelta
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from . import crud, models, schemas, auth
from .database import SessionLocal, engine
from .auth import create_access_token, authenticate_user, get_current_active_user, get_current_admin_user
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Адрес фронтенда
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Зависимость для получения сессии БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/users/", response_model=list[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@app.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me/", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_active_user)):
    return current_user

# Пример защищенного route только для админов
@app.get("/admin/")
async def admin_route(current_user: models.User = Depends(get_current_admin_user)):
    return {"message": "Hello Admin!"}

@app.get("/products/", response_model=list[schemas.Product])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = crud.get_products(db, skip=skip, limit=limit)
    return products

@app.post("/products/", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_admin_user)):
    return crud.create_product(db=db, product=product)

@app.get("/orders/", response_model=list[schemas.Order])
def read_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    # Для не-админов показываем только их заказы
    if current_user.role not in ['admin', 'manager']:
        orders = db.query(models.Order).filter(models.Order.user_id == current_user.user_id).offset(skip).limit(limit).all()
    else:
        orders = crud.get_orders(db, skip=skip, limit=limit)
    return orders

@app.post("/orders/", response_model=schemas.Order)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    # Устанавливаем user_id из текущего пользователя
    order.user_id = current_user.user_id
    return crud.create_order(db=db, order=order)

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]

@app.post("/orders/", response_model=schemas.Order)
def create_order(order: OrderCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    # Преобразуем items в JSON для передачи в процедуру
    items_json = []
    for item in order.items:
        items_json.append({
            "product_id": item.product_id,
            "quantity": item.quantity
        })
    
    # Вызываем хранимую процедуру
    try:
        db.execute(
            "CALL create_order(:user_id, :items)",
            {
                "user_id": current_user.user_id,
                "items": json.dumps(items_json)
            }
        )
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    
    # Получаем последний созданный заказ
    last_order = db.query(models.Order).filter(
        models.Order.user_id == current_user.user_id
    ).order_by(models.Order.order_id.desc()).first()
    
    return last_order
