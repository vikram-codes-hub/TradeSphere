import Prediction from "../Models/Prediction.js";
import Stock      from "../Models/Stock.js";
import { addPredictionJob } from "../Queue/prediction.queue.js";

/* ============================================================
   REQUEST PREDICTION
   POST /api/predict
   Now uses BullMQ queue instead of direct axios call
   ============================================================ */
export const requestPrediction = async (req, res, next) => {
  try {
    const { symbol } = req.body;

    if (!symbol)
      return res.status(400).json({ success: false, message: "Please provide a stock symbol." });

    const sym      = symbol.toUpperCase();
    const stockDoc = await Stock.findOne({ symbol: sym });

    // ── Free user daily limit ──────────────────────────────
    if (req.user.role === "free") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayCount = await Prediction.countDocuments({
        user:        req.user._id,
        requestedAt: { $gte: today },
      });
      if (todayCount >= 5)
        return res.status(403).json({
          success:   false,
          message:   "Daily prediction limit reached (5/day). Upgrade to Premium for unlimited.",
          upgradeTo: "premium",
          used:      todayCount,
          limit:     5,
        });
    }

    // ── Check for recent cached prediction (1 hour) ────────
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const cached = await Prediction.findOne({
      symbol:      sym,
      status:      "COMPLETED",
      completedAt: { $gte: oneHourAgo },
    }).sort({ completedAt: -1 });

    if (cached) {
      return res.status(200).json({
        success:    true,
        cached:     true,
        message:    "Returning recent prediction (cached within 1 hour).",
        prediction: cached,
      });
    }

    // ── Create PENDING prediction in DB ───────────────────
    const prediction = await Prediction.create({
      user:         req.user._id,
      symbol:       sym,
      companyName:  stockDoc?.companyName || sym,
      status:       "PENDING",
      currentPrice: stockDoc?.currentPrice || 0,
    });

    // ── Add job to BullMQ queue (non-blocking) ────────────
    // prediction.worker.js will pick this up and call ML service
    await addPredictionJob({
      predictionId: prediction._id.toString(),
      symbol:       sym,
      userId:       req.user._id.toString(),
    });

    // ── Return 202 Accepted immediately ───────────────────
    // Frontend should listen for "prediction:ready" Socket.IO event
    res.status(202).json({
      success:      true,
      message:      `Prediction job queued for ${sym}. You will be notified when ready.`,
      predictionId: prediction._id,
      status:       "PENDING",
      listenFor:    "prediction:ready", // tells frontend what Socket.IO event to listen for
    });

  } catch (err) {
    next(err);
  }
};

/* ============================================================
   GET MY PREDICTIONS
   GET /api/predict/history
   ============================================================ */
export const getMyPredictions = async (req, res, next) => {
  try {
    const { symbol, status, page = 1, limit = 10 } = req.query;

    let query = { user: req.user._id };
    if (symbol) query.symbol = symbol.toUpperCase();
    if (status) query.status = status.toUpperCase();

    const skip        = (parseInt(page) - 1) * parseInt(limit);
    const total       = await Prediction.countDocuments(query);
    const predictions = await Prediction.getHistory(req.user._id, parseInt(limit));

    res.status(200).json({
      success: true,
      count:   predictions.length,
      total,
      page:    parseInt(page),
      pages:   Math.ceil(total / parseInt(limit)),
      predictions,
    });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   GET SINGLE PREDICTION
   GET /api/predict/:id
   ============================================================ */
export const getPrediction = async (req, res, next) => {
  try {
    const prediction = await Prediction.findOne({
      _id:  req.params.id,
      user: req.user._id,
    });
    if (!prediction)
      return res.status(404).json({ success: false, message: "Prediction not found." });

    res.status(200).json({ success: true, prediction });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   GET LATEST PREDICTION FOR A SYMBOL
   GET /api/predict/latest/:symbol
   ============================================================ */
export const getLatestPrediction = async (req, res, next) => {
  try {
    const symbol     = req.params.symbol.toUpperCase();
    const prediction = await Prediction.getLatest(req.user._id, symbol);

    if (!prediction)
      return res.status(404).json({
        success: false,
        message: `No completed prediction found for ${symbol}.`,
      });

    res.status(200).json({ success: true, prediction });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   GET TOP BULLISH PREDICTIONS
   GET /api/predict/trending
   Public
   ============================================================ */
export const getTrendingPredictions = async (req, res, next) => {
  try {
    const predictions = await Prediction.getTopBullish(10);
    res.status(200).json({ success: true, count: predictions.length, predictions });
  } catch (err) {
    next(err);
  }
};

/* ============================================================
   GET PREDICTION USAGE
   GET /api/predict/usage
   ============================================================ */
export const getPredictionUsage = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = await Prediction.countDocuments({
      user:        req.user._id,
      requestedAt: { $gte: today },
    });

    const totalCount = await Prediction.countDocuments({ user: req.user._id });
    const limit      = req.user.role === "free" ? 5 : 999;

    res.status(200).json({
      success: true,
      usage: {
        today:     todayCount,
        limit,
        remaining: Math.max(0, limit - todayCount),
        total:     totalCount,
        isPremium: req.user.role !== "free",
      },
    });
  } catch (err) {
    next(err);
  }
};