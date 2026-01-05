import os

env_path = r'd:\DentalFlow\.env'

if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        content = f.read()
    
    # Replace the host
    new_content = content.replace('db.uadurfgrkjjbexnpcjdq.supabase.co', 'aws-0-us-east-1.pooler.supabase.com')
    
    with open(env_path, 'w') as f:
        f.write(new_content)
    
    print("Fixed .env DATABASE_URL host.")
else:
    print(".env not found")
