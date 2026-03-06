import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';


/* ============================================================
   AUTH MIDDLEWARE
   Verifies JWT token from Authorization header.
   Attaches req.user to every protected route.
   ============================================================ */
export const authMiddleware = async (req, res, next) => {
    try {
       let token
         if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } 
        if(!token) {
             return res.status(401).json({ success: false, message: "Access denied. No token provided.",});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
      return res.status(401).json({success: false, message: "Token is valid but user no longer exists.",});
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false,message: "Your account has been banned. Contact support.",});
    }
     req.user = user;
    next();

    } catch (error) {
       if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please log in again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication error.",
    });
  }
}


/* ============================================================
   PREMIUM MIDDLEWARE
   Use after protect — checks if user has premium role.
   ============================================================ */
 export   const requirePremium = (req, res, next) => {
    if(req.user && req.user.role === 'premium') {
      return   next();
    } 
     return res.status(403).json({success: false, message: "This feature requires a Premium account.", upgradeTo: "premium",});
   }

   /* ============================================================
   ADMIN MIDDLEWARE
   Use after protect — checks if user has admin role.
   ============================================================ */
  export  const requireAdmin = (req, res, next) => {
    if(req.user && req.user.role === 'admin') {
      return   next();
    }   
        return res.status(403).json({success: false, message: "Admin access required.",});
   }