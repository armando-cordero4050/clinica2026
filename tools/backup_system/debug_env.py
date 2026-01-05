import os
from urllib.parse import urlparse

env_path = r'd:\DentalFlow\.env'

if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        for line in f:
            if line.startswith('DATABASE_URL='):
                url = line.strip().split('=', 1)[1].strip("'").strip('"')
                try:
                    parsed = urlparse(url)
                    print(f"User: {parsed.username}")
                    # Mask password
                    print(f"Pass: {'*' * len(parsed.password) if parsed.password else 'None'}")
                    print(f"Host: {parsed.hostname}")
                    print(f"Port: {parsed.port}")
                    print(f"Path: {parsed.path}")
                except Exception as e:
                    print(f"Parse Error: {e}")
                break
else:
    print(".env not found")
