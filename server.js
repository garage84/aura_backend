require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/authMiddleware");
const User = require("./models/User");

const app = express();

app.use(helmet());

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "10kb" }));

// Limit login and registration attempts
app.use("/api/auth", rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false
}));

app.use("/api/auth", authRoutes);

// Get current logged-in user
app.get("/api/auth/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({
            userId: req.userId
        }).select("userId username createdAt");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            id: user.userId,
            username: user.username,
            createdAt: user.createdAt
        });

    } catch (error) {
        res.status(500).json({
            message: "Could not fetch profile"
        });
    }
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");

        app.listen(PORT, () => {
            console.log(`AURA server running on ${PORT}`);
        });
    })
    .catch(error => {
        console.error("Database connection failed:", error);
        process.exit(1);
    });
