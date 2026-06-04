import requests

admin_email = "sahilpatel0204@gmail.com"
admin_password = "1234"

# 1. Try logging in as admin with role="owner"
payload_owner = {
    "username": admin_email,
    "password": admin_password,
    "role": "owner"
}
res_owner = requests.post("http://127.0.0.1:8000/api/auth/login", data=payload_owner)
print("Login as OWNER status:", res_owner.status_code)
print("Login as OWNER response:", res_owner.json())

# 2. Try logging in as admin with role="admin"
payload_admin = {
    "username": admin_email,
    "password": admin_password,
    "role": "admin"
}
res_admin = requests.post("http://127.0.0.1:8000/api/auth/login", data=payload_admin)
print("Login as ADMIN status:", res_admin.status_code)
print("Login as ADMIN response:", res_admin.json())
