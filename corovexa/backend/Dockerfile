# COROVEXA Backend - Dockerfile for future EC2 deployment
FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Copy dataset
COPY ../data /data

# Expose port
EXPOSE 8000

# Environment variables
ENV COROVEXA_CSV_PATH=/data/COROVEXA_cloud_dataset.csv
ENV PYTHONUNBUFFERED=1

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
