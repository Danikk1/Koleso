FROM python:3.9

WORKDIR /app

# Устанавливаем зависимости для работы с PostgreSQL
RUN apt-get update && apt-get install -y postgresql-client

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY ./app /app/app
COPY wait-for-db.sh /app/wait-for-db.sh

CMD ["/app/wait-for-db.sh", "db", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
