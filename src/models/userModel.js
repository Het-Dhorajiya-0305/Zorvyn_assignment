import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Invalid email"],
            index: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 8,
        },

        role: {
            type: String,
            enum: ["viewer", "analyst", "admin"],
            default: "viewer",
            index: true,
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },

        lastLogin: {
            type: Date,
        },

        refreshToken: {
            type: String,
            select: false,
        },
    },
    { timestamps: true }
);


userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    try {
        this.password = await bcrypt.hash(this.password, 10);
    }
    catch (err) {
        console.error("Error hashing password:", err);
        throw new Error("Password hashing failed");
    }
});


userSchema.methods.isPasswordCorrect = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;