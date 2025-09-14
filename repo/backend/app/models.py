from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    phone_number = Column(String)
    role = Column(String, nullable=False, default='user')
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    orders = relationship("Order", back_populates="user")

class ProductCategory(Base):
    __tablename__ = "product_categories"

    category_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    slug = Column(String, unique=True, nullable=False)

    products = relationship("Product", back_populates="category")

class Manufacturer(Base):
    __tablename__ = "manufacturers"

    manufacturer_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    country = Column(String)

    products = relationship("Product", back_populates="manufacturer")

class Product(Base):
    __tablename__ = "products"

    product_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    price = Column(Float, nullable=False)
    stock_quantity = Column(Integer, nullable=False, default=0)
    category_id = Column(Integer, ForeignKey("product_categories.category_id"), nullable=False)
    manufacturer_id = Column(Integer, ForeignKey("manufacturers.manufacturer_id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    category = relationship("ProductCategory", back_populates="products")
    manufacturer = relationship("Manufacturer", back_populates="products")
    attributes = relationship("ProductAttribute", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")

class ProductAttribute(Base):
    __tablename__ = "product_attributes"

    product_id = Column(Integer, ForeignKey("products.product_id"), primary_key=True)
    attribute_name = Column(String, primary_key=True)
    attribute_value = Column(String, nullable=False)

    product = relationship("Product", back_populates="attributes")

class Order(Base):
    __tablename__ = "orders"

    order_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    status = Column(String, nullable=False, default='new')
    total_amount = Column(Float, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    order_item_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.order_id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

class AuditLog(Base):
    __tablename__ = "audit_log"

    log_id = Column(Integer, primary_key=True, index=True)
    table_name = Column(String, nullable=False)
    record_id = Column(Integer, nullable=False)
    action = Column(String, nullable=False)
    old_value = Column(JSON)
    new_value = Column(JSON)
    changed_by = Column(Integer, ForeignKey("users.user_id"))
    changed_at = Column(DateTime(timezone=True), server_default=func.now())