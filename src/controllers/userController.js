import jwt from 'jsonwebtoken';
import validator from 'validator';
import User from '../models/userModel.js';


const generateToken = async (user) => {

    try {
        const token = jwt.sign(
            {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY
            }
        )

        user.refreshToken = token;
        await user.save({ validateBeforeSave: false })

        return token;
    } catch (error) {
        console.error("Error generating token:", error);
        throw error;
    }
}

const registerUser = async (req, res) => {
    try {

        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Please provide all the fields"
            })
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email"
            })
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long"
            })
        }

        const existedUser = await User.findOne({ email })

        if (existedUser) {
            return res.status(400).json({
                success: false,
                message: "User already exist"
            })
        }

        const newUser = await User.create({
            name,
            email,
            password,
            role
        })

        return res.status(200).json({
            success: true,
            message: "User registered successfully"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide all the fields"
            })
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email"
            })
        }

        const user = await User.findOne({ email });

        
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User does not exist"
            })
        }
        
        if (user.status === "inactive") {
            return res.status(403).json({
                success: false,
                message: "User account is inactive. Please contact administrator."
            })
        }
        

        const isPasswordCorrect = await user.isPasswordCorrect(password);

        if (!isPasswordCorrect) {
            return res.status(400).json({
                success: false,
                message: "Invalid password"
            })
        }

        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });


        const token = await generateToken(user);

        const loginedUser = await User.findById(user._id);

        const option = {
            httpOnly: true,
            secure: false,
            sameSite: "Lax",
            path: "/",
            maxAge: 24 * 60 * 60 * 1000
        };


        // for production 


        // const option = {
        //     httpOnly: true,
        //     secure: true,
        //     sameSite: "None",
        //     path: "/",
        //     maxAge: 12 * 60 * 60 * 1000
        // };


        return res.status(200).cookie("refreshToken", token, option).json({
            success: true,
            user: {
                id: loginedUser._id,
                name: loginedUser.name,
                email: loginedUser.email,
                role: loginedUser.role,
                status: loginedUser.status,
            },
            token,
            message: "login successfully"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


// const logoutUser = async (req, res) => {
//     try {
//         const userId = req.user._id;

//         const user = await User.findById(userId);

//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found"
//             })
//         }

//         user.refreshToken = null;
//         await user.save({ validateBeforeSave: false });

//         const logoutUser = await User.findById(userId).select('-password -refreshToken');

//         // const option = {
//         //     httpOnly: true,
//         //     secure: false,
//         //     sameSite: "Lax",
//         //     path: "/",
//         //     maxAge: 24 * 60 * 60 * 1000
//         // };


//         // for production 


//         const option = {
//             httpOnly: true,
//             secure: true,
//             sameSite: "None",
//             path: "/",
//             maxAge: 24 * 60 * 60 * 1000
//         };

//         return res.status(200).clearCookie("refreshToken", option).json({
//             success: true,
//             user: logoutUser,
//             message: "Logout successfully"
//         })


//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }

const getUserInfo = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select('-password -refreshToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        return res.status(200).json({
            success: true,
            user,
            message: "User fetched successfully"
        })
    }
    catch (error) {
        return res.status(500).json({
            success: true,
            message: error.message
        })
    }
}

const updateUserInfo = async (req, res) => {
    try {
        const {role,status}=req.body;

        if(!role || !status){
            return res.status(400).json({
                success: false,
                message: "Please provide all the fields"
            })
        }
        
        const user = await User.findByIdAndUpdate(req.params.id,{role,status},{new:true}).select("-password -refreshToken");

        if(!user)
        {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        return res.status(200).json({
            success: true,
            data: user,
            message: "User updated successfully"
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password -refreshToken").sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: users.length,
            data: users,
            message: "Users fetched successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export { registerUser, loginUser, getUserInfo, getAllUsers, updateUserInfo };