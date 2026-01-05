import os

env_path = r'd:\DentalFlow\.env'
project_ref = 'uadurfgrkjjbexnpcjdq'

if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        content = f.read()
    
    # We need to find "postgres:" and replace with "postgres.ref:"
    # But be careful not to double replace if it's already there (though debug said it's just postgres)
    
    if f"postgres.{project_ref}:" not in content:
        # Check if "postgres:" exists
        if "postgres:" in content:
            new_content = content.replace("postgres:", f"postgres.{project_ref}:")
            
            with open(env_path, 'w') as f:
                f.write(new_content)
            print(f"Fixed User: postgres -> postgres.{project_ref}")
        else:
            print("Could not find 'postgres:' in .env")
    else:
        print("User already formatted correctly.")

else:
    print(".env not found")
