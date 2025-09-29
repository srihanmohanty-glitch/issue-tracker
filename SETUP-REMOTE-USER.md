# Remote User Setup Instructions

## 🚀 How to Run the Issue Tracker

### **Prerequisites:**
1. **Node.js** installed on the laptop
2. **Internet connection** (for MongoDB Atlas)

### **Setup Steps:**

#### **Step 1: Install Dependencies**
```bash
npm install
```

#### **Step 2: Configure Database Connection**
1. Create a file called `.env` in the `backend` folder
2. Add your MongoDB Atlas connection string:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/issue-tracker
JWT_SECRET=your-secret-key-here
```

#### **Step 3: Start the Application**
```bash
npm run dev
```

#### **Step 4: Access the App**
- Open browser and go to: `http://localhost:5173`
- Login with demo credentials:
  - **Admin**: admin@helpcenter.com / admin123
  - **User**: user@helpcenter.com / user123

## ✅ **What This Achieves:**
- ✅ **Shared Database**: Both admin and remote user see the same data
- ✅ **Real-time Updates**: Changes appear immediately for both users
- ✅ **Full Functionality**: Create issues, respond, update status
- ✅ **No Server Needed**: Just need MongoDB Atlas connection

## 🔧 **Troubleshooting:**
- Make sure MongoDB Atlas allows connections from any IP (0.0.0.0/0)
- Check that the connection string is correct
- Ensure internet connection is stable
