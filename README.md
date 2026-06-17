# 🏆 PlayGround - Sports Turf & Court Booking Platform

PlayGround is a modern, high-performance web application designed to connect sports enthusiasts with turf owners. It allows users to discover local turfs and courts, view real-time slot availability, read verified reviews, and book their sessions in seconds. The application features roles for **Customers (Users)**, **Court Owners**, and **Administrators** to manage listings, bookings, disputes, and reviews.

---

## 🚀 Key Features

### 👤 User Roles & Authentication
- **Secure Authentication**: Built using JWT tokens with password hashing via `passlib[bcrypt]`.
- **Customers**: Search, filter, and book courts, manage favorites, rate/review turfs, and raise disputes.
- **Court Owners**: List grounds, configure court facilities, set up dynamic slot pricing, manage bookings, and handle dispute resolutions.
- **Administrators**: Moderate listings, manage dispute escalations, view analytics, and control platforms.

### 📅 Booking & Slot Management
- **Interactive Calendar**: View and select available hourly slots in real-time.
- **Dynamic Pricing**: Support for off-peak/peak-hour prices, automated discounts, and last-minute deals.
- **Instant Confirmation**: Real-time slot reservation flow preventing double bookings.

### 🗺️ Discovery & Interactive Maps
- **Location-Based Search**: Integrated interactive mapping using Leaflet and OpenStreetMap.
- **Filter and Search**: Filter venues by sport type (Cricket, Football, Badminton, Pickleball, Volleyball), price range, ratings, and amenities.

### 💬 Engagement & Support
- **Review System**: Customers can submit ratings and detailed feedback on their playing experience.
- **Dispute Resolution**: Dedicated dispute raising and resolving workflow for booking issues.

---

## 💻 Tech Stack

### Frontend
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Core Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Maps**: [React Leaflet](https://react-leaflet.js.org/)
- **HTTP Client**: [Axios](https://axios-http.com/)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **ASGI Server**: [Uvicorn](https://www.uvicorn.org/)
- **Database OGM**: [Beanie OGM](https://beanie-odm.dev/) (MongoDB Async Object-Document Mapper)
- **Database Driver**: [Motor](https://motor.readthedocs.io/) (Async MongoDB Python Driver)
- **Validation**: [Pydantic v2](https://docs.pydantic.dev/)
- **Authentication**: JWT via `python-jose` and password hashing with `passlib`

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18.x or higher)
- Python (v3.10 or higher)
- MongoDB Atlas account (or local MongoDB instance)

---

### 1. Backend Setup

Navigate to the `backend` directory:
```bash
cd backend
```

Create a virtual environment:
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

Install the dependencies:
```bash
pip install -r requirements.txt
```

Create a `.env` file from the example:
```bash
cp .env.example .env
```
Update `.env` with your MongoDB connection string and secret credentials:
```env
MONGODB_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/playground
SECRET_KEY=your_super_secret_jwt_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

Start the FastAPI development server:
```bash
python main.py
```
*The API will run locally at `http://localhost:8000`.*

---

### 2. Frontend Setup

Navigate to the `frontend` directory:
```bash
cd ../frontend
```

Install the node packages:
```bash
npm install
```

Create a `.env.local` file for environment configurations (such as custom maps keys):
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Run the development server:
```bash
npm run dev
```
*Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.*

---

## 📂 Project Structure

```
PlayGround/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI routers (auth, bookings, grounds, disputes)
│   │   ├── core/         # Core config and security middlewares
│   │   ├── db/           # MongoDB database connection (Beanie initialization)
│   │   ├── models/       # Beanie Document ODM Models (User, Ground, Booking, etc.)
│   │   └── schemas/      # Pydantic Schemas for validation
│   ├── static/           # Static file hosting (uploads/images)
│   ├── main.py           # FastAPI entrypoint
│   └── requirements.txt  # Python requirements
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js App Router pages (auth, explore, booking, dashboards)
│   │   ├── components/   # Reusable React components (Navbar, Hero, Cards)
│   │   ├── context/      # Context providers (AuthContext)
│   │   └── utils/        # Axios client & api helper utilities
│   ├── public/           # Static assets
│   ├── tailwind.config.js # Tailwind CSS configuration
│   └── package.json      # Node scripts and dependencies
└── README.md             # Project documentation (This file)
```

---

## 🤝 Contributing
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License
Distributed under the MIT License. See `backend/LICENSE` for more information.
