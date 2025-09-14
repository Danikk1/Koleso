from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    role: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class ProductCategoryBase(BaseModel):
    name: str
    slug: str

class ProductCategory(ProductCategoryBase):
    category_id: int

    class Config:
        orm_mode = True

class ManufacturerBase(BaseModel):
    name: str
    country: Optional[str] = None

class Manufacturer(ManufacturerBase):
    manufacturer_id: int

    class Config:
        orm_mode = True

class ProductAttributeBase(BaseModel):
    attribute_name: str
    attribute_value: str

class ProductAttribute(ProductAttributeBase):
    product_id: int

    class Config:
        orm_mode = True

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock_quantity: int
    category_id: int
    manufacturer_id: int
    is_active: bool = True

class ProductCreate(ProductBase):
    attributes: List[ProductAttributeBase] = []

class Product(ProductBase):
    product_id: int
    created_at: datetime
    attributes: List[ProductAttribute] = []

    class Config:
        orm_mode = True

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    unit_price: float

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    order_item_id: int
    order_id: int

    class Config:
        orm_mode = True

class OrderBase(BaseModel):
    user_id: int
    status: str = 'new'
    total_amount: float = 0

class OrderCreate(OrderBase):
    items: List[OrderItemCreate] = []

class Order(OrderBase):
    order_id: int
    created_at: datetime
    updated_at: datetime
    items: List[OrderItem] = []

    class Config:
        orm_mode = True

class AuditLogBase(BaseModel):
    table_name: str
    record_id: int
    action: str
    old_value: Optional[dict] = None
    new_value: Optional[dict] = None
    changed_by: Optional[int] = None

class AuditLog(AuditLogBase):
    log_id: int
    changed_at: datetime

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None