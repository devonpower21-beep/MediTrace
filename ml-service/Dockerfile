FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
# gcc might be needed for some python extensions, keep it just in case but try to be slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install dependencies (ensure requirements.txt doesn't have heavy "training-only" deps if we can split them)
# For now, we reuse the same one but the user can optimize requirements.txt later.
# We add --no-cache-dir to keep image small.
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000

# Start command
CMD ["python", "app.py"]
