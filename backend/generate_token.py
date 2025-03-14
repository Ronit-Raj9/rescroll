from app.utils.security import generate_password_reset_token

# Generate a token for test3@example.com
token = generate_password_reset_token("test3@example.com")
print(f"Token: {token}") 