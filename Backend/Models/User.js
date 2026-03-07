import mongoose from "mongoose";
import bcrypt    from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, "Name is required"],
      trim:     true,
      minLength:[2,  "Name must be at least 2 characters"],
      maxLength:[50, "Name cannot exceed 50 characters"],
    },

    email: {
      type:     String,
      required: [true, "Email is required"],
      unique:   true,
      lowercase:true,
      trim:     true,
      match:    [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    password: {
      type:     String,
      required: [true, "Password is required"],
      minLength:[6, "Password must be at least 6 characters"],
      select:   false, // never returned in queries by default
    },

    role: {
      type:    String,
      enum:    ["free", "premium", "admin"],
      default: "free",
    },

    avatar: {
      type:    String,
      default: "",
    },

    // ── Portfolio ───────────────────────────────────────
    cashBalance: {
      type:    Number,
      default: 100000, // ₹1,00,000 starting balance
      min:     0,
    },

    totalDeposited: {
      type:    Number,
      default: 100000,
    },

    // ── Stats ───────────────────────────────────────────
    totalTrades: {
      type:    Number,
      default: 0,
    },

    winningTrades: {
      type:    Number,
      default: 0,
    },

    totalPnl: {
      type:    Number,
      default: 0,
    },

    // ── Watchlist ───────────────────────────────────────
    watchlist: [{
      type: String, // stock symbols e.g. "TSLA", "RELIANCE.NS"
    }],

    // ── Account status ──────────────────────────────────
    isBanned: {
      type:    Boolean,
      default: false,
    },

    banReason: {
      type:    String,
      default: null,
    },

    lastLogin: {
      type: Date,
    },

    // ── Password reset ──────────────────────────────────
    resetPasswordToken:   String,
    resetPasswordExpire:  Date,
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

/* ── Hash password before save ───────────────────────────── */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return 
  const salt   = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
 
});

/* ── Instance method: compare password ───────────────────── */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/* ── Instance method: get win rate ───────────────────────── */
userSchema.methods.getWinRate = function () {
  if (this.totalTrades === 0) return 0;
  return parseFloat(((this.winningTrades / this.totalTrades) * 100).toFixed(2));
};

/* ── Instance method: get portfolio value (pass holdings) ── */
userSchema.methods.getNetWorth = function (portfolioValue = 0) {
  return this.cashBalance + portfolioValue;
};

/* ── Virtual: public profile (no sensitive fields) ───────── */
userSchema.virtual("publicProfile").get(function () {
  return {
    _id:          this._id,
    name:         this.name,
    email:        this.email,
    role:         this.role,
    avatar:       this.avatar,
    cashBalance:  this.cashBalance,
    totalTrades:  this.totalTrades,
    winRate:      this.getWinRate(),
    totalPnl:     this.totalPnl,
    watchlist:    this.watchlist,
    isBanned:     this.isBanned,
    createdAt:    this.createdAt,
    lastLogin:    this.lastLogin,
  };
});

const User = mongoose.model("User", userSchema);
export default User;