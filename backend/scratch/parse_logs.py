with open("output.txt", "r", encoding="utf-16", errors="ignore") as f:
    lines = f.readlines()

for line in lines[-2000:]: # check the last 2000 lines
    line = line.strip()
    if len(line) < 500:
        if "api" in line.lower() or "ground" in line.lower() or "401" in line or "post" in line.lower():
            print(line)
