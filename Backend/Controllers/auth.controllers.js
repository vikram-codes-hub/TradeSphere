import jwt from "jsonwebtoken";
import User from "../Models/User.js";

/* ── Generate JWT ────────────────────────────────────────── */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

/* ── Send token response ─────────────────────────────────── */
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      cashBalance: user.cashBalance,
      totalTrades: user.totalTrades,
      totalPnl: user.totalPnl,
      watchlist: user.watchlist,
      createdAt: user.createdAt,
    },
  });
};

//register new user

export const register = async (req, res,next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    const user = await User.create({
      name,
      email,
      password,
    });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

//Login user
export const login = async (req, res,next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (user.isBanned) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Your account has been banned. Please contact support.",
        });
    }
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    sendTokenResponse(user, 200, res);
  } catch (error) {next(error);}
};

//    Protected route to get current user profile

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        cashBalance: user.cashBalance,
        totalTrades: user.totalTrades,
        totalPnl: user.totalPnl,
        winRate: user.getWinRate(),
        watchlist: user.watchlist,
        isBanned: user.isBanned,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (err) {
    next(err);
  }
};

//update profile
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });

    // Update name if provided
    if (req.body.name && req.body.name.trim()) user.name = req.body.name.trim();

    // Update avatar if file uploaded
    if (req.file) {
      if (user.avatar) {
        await deleteFromCloudinary(getPublicIdFromUrl(user.avatar));
      }
      user.avatar = req.file.path; // Cloudinary URL
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};
//chnage password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide current and new password.",
        });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({
          success: false,
          message: "New password must be at least 6 characters long.",
        });
    }
    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect." });
    }
    user.password = newPassword;
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    next(error);
  }
};

//Logout
export const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};
