import requests

token = "test"
res = requests.post("http://127.0.0.1:8000/api/bookings/", headers={"Authorization": f"Bearer {token}"}, json={})
print("URL:", res.url)
print("Status Code:", res.status_code)
print("History:", res.history)
print("Text:", res.text)
