const path = require("path");
const express = require("express");
const axios = require("axios");
const session = require("express-session");

const app = express();
const BASE_API_URL = process.env.BASE_API_URL || "https://dev.resq-qa.com";
const DEFAULT_SESSION_SECRET = "resq-admin-secret";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || DEFAULT_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 4 },
  })
);

const ensureAuth = (req, res, next) => {
  if (req.session?.user && req.session?.tokens?.accessToken) {
    return next();
  }

  res.redirect("/login");
};

const buildHeaders = (req) => {
  const accessToken = req.session?.tokens?.accessToken;
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
};

const extractErrorMessage = (error, fallback) => {
  const data = error.response?.data || {};
  return data.message || data.error || fallback;
};

const formatNumber = (value) => {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric.toLocaleString("en-US") : "—";
};

const formatCurrency = (value) => {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric)
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(numeric)
    : "—";
};

const formatPercent = (value) => {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? `${numeric.toLocaleString("en-US")}%` : "—";
};

app.get("/", (req, res) => {
  return res.redirect(req.session?.user ? "/dashboard" : "/login");
});

const defaultLoginState = { status: null, phoneNumber: "" };

app.get("/login", (req, res) => {
  if (req.session?.user) {
    return res.redirect("/dashboard");
  }

  res.render("login", defaultLoginState);
});


app.post("/request-otp", async (req, res) => {
  const phoneNumber = (req.body.phoneNumber || "").trim();

  console.log("📩 Incoming Request:", req.body);

  if (!phoneNumber) {
    const errorResponse = {
      status: { type: "error", message: "Please enter your phone number." },
      phoneNumber,
    };

    console.log("❌ Response Sent:", errorResponse);
    return res.render("login", errorResponse);
  }

  try {
    const response = await axios.post(`${BASE_API_URL}/api/v1/auth/admin/login`, {
      phoneNumber,
    });

    const payload = response.data || {};
    const successMessage = payload.message || "OTP sent successfully.";
    const expiresIn = payload.data?.expiresIn;

    const params = new URLSearchParams({
      phoneNumber,
      statusType: "success",
      message: successMessage,
    });

    if (expiresIn) {
      params.append("expiresIn", expiresIn);
    }

    const redirectUrl = `/verify?${params.toString()}`;

    console.log("➡️ Redirecting To:", redirectUrl);

    return res.redirect(redirectUrl);
  } catch (error) {
    const message = extractErrorMessage(
      error,
      "Unable to send OTP. Please try again."
    );

    const errorResponse = {
      status: { type: "error", message },
      phoneNumber,
    };

    console.log("❌ Response Sent:", errorResponse);

    return res.render("login", errorResponse);
  }
});

app.get("/verify", (req, res) => {
  const phoneNumber = (req.query.phoneNumber || "").trim();
  const status = req.query.message
    ? {
        type: req.query.statusType || "success",
        message: req.query.message,
        expiresIn: req.query.expiresIn,
      }
    : null;

  res.render("verify", { status, phoneNumber });
});

app.post("/verify-otp", async (req, res) => {
  const phoneNumber = (req.body.phoneNumber || "").trim();
  const otp = (req.body.otp || "").trim();

  if (!phoneNumber || !otp) {
    return res.render("verify", {
      status: { type: "error", message: "Provide both phone number and OTP." },
      phoneNumber,
    });
  }

  try {
    const response = await axios.post(`${BASE_API_URL}/api/v1/auth/admin/verify-otp`, {
      phoneNumber,
      otp,
    });

    const payload = response.data || {};
    req.session.user = payload.data?.user || null;
    req.session.tokens = {
      accessToken: payload.data?.accessToken,
      refreshToken: payload.data?.refreshToken,
    };

    return res.redirect("/dashboard");
  } catch (error) {
    const message = extractErrorMessage(
      error,
      "We could not verify the OTP. Please try again."
    );

    return res.render("verify", {
      status: { type: "error", message },
      phoneNumber,
    });
  }
});

app.get("/forgot-password", (req, res) => {
  res.render("forgot", { status: null });
});

app.post("/forgot-password", async (req, res) => {
  const phoneNumber = (req.body.phoneNumber || "").trim();

  if (!phoneNumber) {
    return res.render("forgot", {
      status: { type: "error", message: "Please enter your phone number." },
    });
  }

  try {
    const response = await axios.post(`${BASE_API_URL}/api/v1/auth/admin/forgot-password`, {
      phoneNumber,
    });

    const payload = response.data || {};

    return res.render("forgot", {
      status: {
        type: "success",
        message: payload.message || "OTP sent successfully for password reset.",
        expiresIn: payload.data?.expiresIn,
      },
    });
  } catch (error) {
    const message = extractErrorMessage(
      error,
      "Unable to reach the password reset service. Please try again."
    );

    return res.render("forgot", {
      status: { type: "error", message },
    });
  }
});

app.get("/dashboard", ensureAuth, async (req, res) => {
  try {
    const [statsRes, pendingRes, driversRes, bookingsRes] = await Promise.allSettled([
      axios.get(`${BASE_API_URL}/api/v1/admin/dashboard/stats`, {
        headers: buildHeaders(req),
      }),
      axios.get(`${BASE_API_URL}/api/v1/admin/drivers/pending`, {
        headers: buildHeaders(req),
      }),
      axios.get(`${BASE_API_URL}/api/v1/admin/drivers`, {
        headers: buildHeaders(req),
      }),
      axios.get(`${BASE_API_URL}/api/v1/admin/bookings`, {
        headers: buildHeaders(req),
      }),
    ]);

    const stats =
      statsRes.status === "fulfilled"
        ? statsRes.value.data?.data || {}
        : {};
    const pendingDrivers =
      pendingRes.status === "fulfilled" &&
      Array.isArray(pendingRes.value.data?.data)
        ? pendingRes.value.data.data
        : [];
    const drivers =
      driversRes.status === "fulfilled" &&
      Array.isArray(driversRes.value.data?.data)
        ? driversRes.value.data.data
        : [];
    const bookings =
      bookingsRes.status === "fulfilled" &&
      Array.isArray(bookingsRes.value.data?.data)
        ? bookingsRes.value.data.data
        : [];

    const orderedDrivers = [...drivers].sort((a, b) => {
      const aJoined = new Date(a.joinedAt || a.createdAt || 0).getTime();
      const bJoined = new Date(b.joinedAt || b.createdAt || 0).getTime();
      return aJoined - bJoined;
    });

    const feedback = req.query.message
      ? { type: req.query.type || "success", message: decodeURIComponent(req.query.message) }
      : null;

    const overview = stats.overview || {};
    const usersMetrics = stats.users || {};
    const driversMetrics = stats.drivers || {};
    const tripsMetrics = stats.trips || {};
    const revenueMetrics = stats.revenue || {};
    const recentActivity = Array.isArray(stats.recentActivity) ? stats.recentActivity : [];
    const popularLocations = Array.isArray(stats.popularLocations)
      ? stats.popularLocations
      : [];
    const driverCancellations =
      recentActivity.filter(
        (event) =>
          event?.type?.toLowerCase().includes("cancel") ||
          event?.status?.toUpperCase() === "CANCELLED"
      ) || [];
    const timestamp = stats.timestamp || null;

    const statTiles = [
      {
        label: "Total trips",
        value: formatNumber(overview.totalTrips),
        subtext: `Active trips: ${formatNumber(overview.activeTrips)}`,
        accent: "red",
      },
      {
        label: "Revenue",
        value: formatCurrency(overview.totalRevenue),
        subtext: `Today: ${formatCurrency(revenueMetrics.today)}`,
        accent: "green",
      },
      {
        label: "Drivers",
        value: formatNumber(overview.totalDrivers),
        subtext: `${formatNumber(driversMetrics.online)} online`,
        accent: "blue",
      },
      {
        label: "Pending approvals",
        value: formatNumber(overview.pendingApprovals),
        subtext: `${formatNumber(driversMetrics.pending)} documents`,
        accent: "orange",
      },
    ];

    res.render("dashboard", {
      stats,
      statTiles,
      pendingDrivers,
      drivers: orderedDrivers,
      bookings,
      driverCancellations,
      usersMetrics,
      driversMetrics,
      tripsMetrics,
      revenueMetrics,
      recentActivity,
      popularLocations,
      timestamp,
      user: req.session.user,
      feedback,
    });
  } catch (error) {
    console.error("Dashboard error", error.message);
    const fallbackStatTiles = [
      { label: "Total trips", value: "—", subtext: "Active trips: —", accent: "red" },
      { label: "Revenue", value: "—", subtext: "Today: —", accent: "green" },
      { label: "Drivers", value: "—", subtext: "— online", accent: "blue" },
      { label: "Pending approvals", value: "—", subtext: "Documents pending", accent: "orange" },
    ];
    res.render("dashboard", {
      stats: {
        overview: {},
        users: {},
        drivers: {},
        trips: {},
        revenue: {},
        recentActivity: [],
        popularLocations: [],
      },
      statTiles: fallbackStatTiles,
      pendingDrivers: [],
      drivers: [],
      usersMetrics: {},
      driversMetrics: {},
      tripsMetrics: {},
      revenueMetrics: {},
      recentActivity: [],
      popularLocations: [],
      bookings: [],
      driverCancellations: [],
      timestamp: null,
      user: req.session.user,
      feedback: {
        type: "error",
        message: "Unable to load dashboard right now.",
      },
    });
  }
});

app.post("/drivers/:driverId/approve", ensureAuth, async (req, res) => {
  const driverId = req.params.driverId;

  try {
    await axios.post(
      `${BASE_API_URL}/api/v1/admin/drivers/${driverId}/approve`,
      {},
      { headers: buildHeaders(req) }
    );

    return res.redirect(
      `/dashboard?message=${encodeURIComponent("Driver approved")}&type=success`
    );
  } catch (error) {
    const message = error.response?.data?.message || "Unable to approve driver.";
    return res.redirect(`/dashboard?message=${encodeURIComponent(message)}&type=error`);
  }
});

app.post("/drivers/:driverId/reject", ensureAuth, async (req, res) => {
  const driverId = req.params.driverId;

  try {
    await axios.post(
      `${BASE_API_URL}/api/v1/admin/drivers/${driverId}/reject`,
      {},
      { headers: buildHeaders(req) }
    );

    return res.redirect(
      `/dashboard?message=${encodeURIComponent("Driver rejected")}&type=success`
    );
  } catch (error) {
    const message = error.response?.data?.message || "Unable to reject driver.";
    return res.redirect(`/dashboard?message=${encodeURIComponent(message)}&type=error`);
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
