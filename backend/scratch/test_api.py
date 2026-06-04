import requests

headers = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3Nzk1NDY4MDQsInN1YiI6IjZhMDMxNjUxM2U5NWFhOTE1ZDVkYTA3ZiJ9.IgJj3dxYmj92ckLmK0tE3h5bGJfTcp1DwXPW9lL8TtU"
}

try:
    res = requests.get("http://127.0.0.1:8000/api/admin/stats", headers=headers)
    print(f"Status: {res.status_code}")
    print(f"Body: {res.text}")
except Exception as e:
    print(f"Error: {e}")
