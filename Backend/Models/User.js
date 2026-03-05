import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, "Name is required"],
      trim:     true,
      minlength: [2,  "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type:     String,
      required: [true, "Email is required"],
      unique:   true,
      lowercase: true,
      trim:     true,
      match:    [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    password: {
      type:      String,
      required:  [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select:    false, // never returned in queries by default
    },

    role: {
      type:    String,
      enum:    ["user", "premium", "admin"],
      default: "user",
    },

    // Virtual trading balance (in paise to avoid float issues)
    // Default: ₹1,00,000 = 10,000,000 paise
    balance: {
      type:    Number,
      default: 10000000,
      min:     [0, "Balance cannot be negative"],
    },

    bio: {
      type:      String,
      maxlength: [200, "Bio cannot exceed 200 characters"],
      default:   "",
    },

    avatar: {
      type:    String,
      default: "",
    },

    // JWT blacklist support — store last logout time
    passwordChangedAt: {
      type: Date,
    },

    isActive: {
      type:    Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// ── Indexes ──────────────────────────────────────────────────
UserSchema.index({ email: 1 });

// ── Hash password before save ────────────────────────────────
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt    = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// ── Instance method: compare password ────────────────────────
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ── Instance method: get balance in rupees ────────────────────
UserSchema.methods.getBalanceInRupees = function () {
  return this.balance / 100;
};

// ── Instance method: deduct balance ──────────────────────────
UserSchema.methods.deductBalance = function (amountInPaise) {
  if (this.balance < amountInPaise) {
    throw new Error("Insufficient balance");
  }
  this.balance -= amountInPaise;
};

// ── Instance method: add balance ──────────────────────────────
UserSchema.methods.addBalance = function (amountInPaise) {
  this.balance += amountInPaise;
};

// ── Virtual: balance in rupees ────────────────────────────────
UserSchema.virtual("balanceInRupees").get(function () {
  return this.balance / 100;
});

// ── Remove password from JSON output ─────────────────────────
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model("User", UserSchema);