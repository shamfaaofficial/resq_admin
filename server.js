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

// Disable LiteSpeed Cache and WordPress optimization
app.use((req, res, next) => {
  res.setHeader("X-LiteSpeed-Cache-Control", "no-cache");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("X-Powered-By", "Express");
  next();
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || DEFAULT_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 4 },
  })
);

// Favicon route to prevent 404 errors
app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "images", "resq-logo.png"));
});

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

app.post("/resend-otp", async (req, res) => {
  const phoneNumber = (req.body.phoneNumber || "").trim();

  if (!phoneNumber) {
    return res.redirect("/verify?message=Phone number is required&statusType=error");
  }

  try {
    const response = await axios.post(`${BASE_API_URL}/api/v1/auth/admin/login`, {
      phoneNumber,
    });

    const payload = response.data || {};
    const successMessage = payload.message || "OTP resent successfully to your phone number";
    const expiresIn = payload.data?.expiresIn;

    const params = new URLSearchParams({
      phoneNumber,
      statusType: "success",
      message: successMessage,
    });

    if (expiresIn) {
      params.append("expiresIn", expiresIn);
    }

    return res.redirect(`/verify?${params.toString()}`);
  } catch (error) {
    const message = extractErrorMessage(
      error,
      "Unable to resend OTP. Please try again."
    );

  }
});

// Driver Management Routes
app.get("/drivers", ensureAuth, async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const status = req.query.status || "";
  const search = req.query.search || "";
  const documentStatus = req.query.documentStatus || "";

  let endpoint = `${BASE_API_URL}/api/v1/admin/drivers?page=${page}&limit=${limit}`;
  if (status) endpoint += `&status=${status}`;
  if (search) endpoint += `&search=${search}`;
  if (documentStatus) endpoint += `&documentStatus=${documentStatus}`;

  try {
    const response = await axios.get(endpoint, { headers: buildHeaders(req) });
    const data = response.data?.data || {};

    res.render("drivers", {
      user: req.session.user,
      drivers: data.drivers || [],
      totalDrivers: data.totalDrivers || data.total || 0,
      pagination: data.pagination || { currentPage: 1, totalPages: 1, total: 0 },
      status,
      search,
      documentStatus,
      message: req.query.message || null,
      type: req.query.type || null,
    });
  } catch (error) {
    console.error("Error fetching drivers:", error.message);
    res.render("drivers", {
      user: req.session.user,
      drivers: [],
      totalDrivers: 0,
      pagination: { currentPage: 1, totalPages: 1, total: 0 },
      status,
      search,
      documentStatus,
      message: "Failed to load drivers.",
      type: "error",
    });
  }
});

app.get("/drivers/:id", ensureAuth, async (req, res) => {
  const driverId = req.params.id;

  try {
    const response = await axios.get(`${BASE_API_URL}/api/v1/admin/drivers/${driverId}`, {
      headers: buildHeaders(req),
    });

    const driver = response.data?.data || null;

    res.render("driver-detail", {
      user: req.session.user,
      driver,
      message: req.query.message || null,
      type: req.query.type || null,
    });
  } catch (error) {
    console.error("Error fetching driver details:", error.message);
    res.render("driver-detail", {
      user: req.session.user,
      driver: null,
      message: "Failed to load driver details.",
      type: "error",
    });
  }
});

app.post("/drivers/:id/delete", ensureAuth, async (req, res) => {
  const driverId = req.params.id;
  const hardDelete = req.query.hardDelete || req.body.hardDelete || "false";

  try {
    const endpoint = `${BASE_API_URL}/api/v1/admin/drivers/${driverId}?hardDelete=${hardDelete}`;
    console.log(`\n🗑️ ========== DELETE DRIVER REQUEST ==========`);
    console.log(`Driver ID: ${driverId}`);
    console.log(`Hard Delete: ${hardDelete}`);
    console.log(`API URL: ${endpoint}`);
    console.log(`Headers:`, buildHeaders(req));

    const response = await axios.delete(
      endpoint,
      { headers: buildHeaders(req) }
    );

    console.log(`✅ Delete successful:`, response.data);
    console.log(`Status: ${response.status}`);
    console.log(`==========================================\n`);

    const deleteType = hardDelete === "true" ? "permanently deleted" : "deleted";
    return res.redirect(`/drivers?message=Driver ${deleteType} successfully&type=success`);
  } catch (error) {
    console.error(`\n❌ ========== DELETE DRIVER ERROR ==========`);
    console.error(`Driver ID: ${driverId}`);
    console.error(`Error Message:`, error.message);
    console.error(`Status Code:`, error.response?.status);
    console.error(`Response Data:`, error.response?.data);
    console.error(`Full Error:`, error.response || error);
    console.error(`==========================================\n`);

    const message = error.response?.data?.message || error.message || "Failed to delete driver.";
    return res.redirect(`/drivers?message=${encodeURIComponent(message)}&type=error`);
  }
});

app.post("/drivers/:id/block", ensureAuth, async (req, res) => {
  const driverId = req.params.id;

  try {
    await axios.post(
      `${BASE_API_URL}/api/v1/admin/drivers/${driverId}/block`,
      {},
      { headers: buildHeaders(req) }
    );

    return res.redirect(`/drivers/${driverId}?message=Driver blocked successfully&type=success`);
  } catch (error) {
    console.error("Driver block error:", error.message);
    const message = error.response?.data?.message || "Failed to block driver.";
    return res.redirect(`/drivers/${driverId}?message=${encodeURIComponent(message)}&type=error`);
  }
});

app.post("/drivers/:id/unblock", ensureAuth, async (req, res) => {
  const driverId = req.params.id;

  try {
    await axios.post(
      `${BASE_API_URL}/api/v1/admin/drivers/${driverId}/unblock`,
      {},
      { headers: buildHeaders(req) }
    );

    return res.redirect(`/drivers/${driverId}?message=Driver unblocked successfully&type=success`);
  } catch (error) {
    console.error("Driver unblock error:", error.message);
    const message = error.response?.data?.message || "Failed to unblock driver.";
    return res.redirect(`/drivers/${driverId}?message=${encodeURIComponent(message)}&type=error`);
  }
});

app.post("/drivers/:id/approve", ensureAuth, async (req, res) => {
  const driverId = req.params.id;

  try {
    console.log(`🔍 Attempting to approve driver: ${driverId}`);
    console.log(`📡 API URL: ${BASE_API_URL}/api/v1/admin/drivers/${driverId}/approve`);

    const response = await axios.post(
      `${BASE_API_URL}/api/v1/admin/drivers/${driverId}/approve`,
      {},
      { headers: buildHeaders(req) }
    );

    console.log(`✅ Driver approved successfully:`, response.data);
    return res.redirect(`/drivers/${driverId}?message=Driver approved successfully&type=success`);
  } catch (error) {
    console.error("❌ Driver approval error:", error.message);
    console.error("📋 Error details:", error.response?.data);
    console.error("🔢 Status code:", error.response?.status);

    const message = error.response?.data?.message || error.message || "Failed to approve driver.";
    return res.redirect(`/drivers/${driverId}?message=${encodeURIComponent(message)}&type=error`);
  }
});

app.post("/drivers/:id/reject", ensureAuth, async (req, res) => {
  const driverId = req.params.id;

  try {
    await axios.post(
      `${BASE_API_URL}/api/v1/admin/drivers/${driverId}/reject`,
      {},
      { headers: buildHeaders(req) }
    );

    return res.redirect(`/drivers/${driverId}?message=Driver rejected successfully&type=success`);
  } catch (error) {
    console.error("Driver rejection error:", error.message);
    const message = error.response?.data?.message || "Failed to reject driver.";
    return res.redirect(`/drivers/${driverId}?message=${encodeURIComponent(message)}&type=error`);
  }
});



// Analytics Dashboard Route
app.get("/analytics", ensureAuth, (req, res) => {
  res.render("analytics", {
    user: req.session.user,
    message: req.query.message || null,
    type: req.query.type || null,
  });
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

app.get("/document-approvals", ensureAuth, async (req, res) => {
  const endpoint = `${BASE_API_URL}/api/v1/admin/drivers/documents?status=pending&page=1&limit=10`;

  try {
    console.log("Requesting URL:", endpoint);
    const headers = buildHeaders(req);
    console.log("Request Headers:", JSON.stringify({ ...headers, Authorization: headers.Authorization ? "Bearer [HIDDEN]" : "None" }, null, 2));

    const response = await axios.get(endpoint, {
      headers,
    });

    const payload = response.data || {};
    console.log("API Response Payload:", JSON.stringify(payload, null, 2));
    const drivers = Array.isArray(payload.data?.drivers) ? payload.data.drivers : [];
    console.log("Extracted Drivers:", JSON.stringify(drivers, null, 2));
    const totalDrivers = payload.data?.totalDrivers ?? drivers.length;

    return res.render("document-approvals", {
      user: req.session.user,
      drivers,
      totalDrivers,
      pendingResponse: payload,
      endpoint,
      errorMessage: null,
    });
  } catch (error) {
    console.error("Document approvals error", error.message);
    const message = extractErrorMessage(error, "Unable to load pending documents.");
    const payload = error.response?.data || null;

    return res.render("document-approvals", {
      user: req.session.user,
      drivers: [],
      totalDrivers: 0,
      pendingResponse: payload,
      endpoint,
      errorMessage: message,
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

app.post("/drivers/:driverId/documents/:documentId/approve", ensureAuth, async (req, res) => {
  const { driverId, documentId } = req.params;

  try {
    await axios.patch(
      `${BASE_API_URL}/api/v1/admin/drivers/${driverId}/documents/${documentId}`,
      { status: "approved" },
      { headers: buildHeaders(req) }
    );

    return res.redirect("/document-approvals");
  } catch (error) {
    console.error("Document approval error", error.message);
    return res.redirect("/document-approvals");
  }
});

app.post("/drivers/:driverId/documents/:documentId/reject", ensureAuth, async (req, res) => {
  const { driverId, documentId } = req.params;

  try {
    await axios.patch(
      `${BASE_API_URL}/api/v1/admin/drivers/${driverId}/documents/${documentId}`,
      {
        status: "rejected",
        rejectionReason: "Document rejected by admin" // Default reason for now
      },
      { headers: buildHeaders(req) }
    );

    return res.redirect("/document-approvals");
  } catch (error) {
    console.error("Document rejection error", error.message);
    return res.redirect("/document-approvals");
  }
});

app.get("/trips", ensureAuth, async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const status = req.query.status || "";
  const search = req.query.search || "";

  let endpoint = `${BASE_API_URL}/api/v1/admin/trips?page=${page}&limit=${limit}`;
  if (status) endpoint += `&status=${status}`;
  if (search) endpoint += `&search=${search}`;

  try {
    const response = await axios.get(endpoint, { headers: buildHeaders(req) });
    const data = response.data?.data || {};

    res.render("trips", {
      user: req.session.user,
      trips: data.trips || [],
      pagination: data.pagination || { page: 1, pages: 1, total: 0 },
      status,
      search,
    });
  } catch (error) {
    console.error("Error fetching trips:", error.message);
    res.render("trips", {
      user: req.session.user,
      trips: [],
      pagination: { page: 1, pages: 1, total: 0 },
      status,
      search,
      error: "Failed to load trips.",
    });
  }
});

app.get("/users", ensureAuth, async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const status = req.query.status || "";
  const search = req.query.search || "";

  let endpoint = `${BASE_API_URL}/api/v1/admin/users?page=${page}&limit=${limit}`;
  if (status) endpoint += `&status=${status}`;
  if (search) endpoint += `&search=${search}`;

  try {
    const response = await axios.get(endpoint, { headers: buildHeaders(req) });
    const data = response.data?.data || {};

    res.render("users", {
      user: req.session.user,
      users: data.users || [],
      totalUsers: data.pagination?.totalUsers || data.total || 0,
      pagination: data.pagination || { currentPage: 1, totalPages: 1, totalUsers: 0 },
      status,
      search,
      message: req.query.message || null,
      type: req.query.type || null,
      errorMessage: null,
    });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.render("users", {
      user: req.session.user,
      users: [],
      totalUsers: 0,
      pagination: { currentPage: 1, totalPages: 1, totalUsers: 0 },
      status,
      search,
      message: "Failed to load users.",
      type: "error",
      errorMessage: message,
    });
  }
});


// Withdrawal Management Routes
app.get("/withdrawals", ensureAuth, async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const status = req.query.status || "";
  const search = req.query.search || "";

  let endpoint = `${BASE_API_URL}/api/v1/admin/withdrawals?page=${page}&limit=${limit}`;
  if (status) endpoint += `&status=${status}`;
  // if (search) endpoint += `&driverId=${search}`; // Assuming search might be driverId or handled by backend search

  try {
    const [withdrawalsRes, statsRes] = await Promise.allSettled([
      axios.get(endpoint, { headers: buildHeaders(req) }),
      axios.get(`${BASE_API_URL}/api/v1/admin/withdrawals/statistics`, { headers: buildHeaders(req) })
    ]);

    const withdrawalsData = withdrawalsRes.status === "fulfilled" ? withdrawalsRes.value.data?.data || {} : {};
    const statsData = statsRes.status === "fulfilled" ? statsRes.value.data?.data?.summary || {} : {};

    res.render("withdrawals", {
      user: req.session.user,
      withdrawals: withdrawalsData.withdrawals || [],
      pagination: withdrawalsData.pagination || { page: 1, limit: 10, total: 0, pages: 1 },
      stats: statsData,
      status,
      search,
      message: req.query.message || null,
      type: req.query.type || null,
    });
  } catch (error) {
    console.error("Error fetching withdrawals:", error.message);
    res.render("withdrawals", {
      user: req.session.user,
      withdrawals: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 1 },
      stats: {},
      status,
      search,
      message: "Failed to load withdrawals.",
      type: "error",
    });
  }
});

app.post("/withdrawals/:id/approve", ensureAuth, async (req, res) => {
  const withdrawalId = req.params.id;
  try {
    await axios.patch(
      `${BASE_API_URL}/api/v1/admin/withdrawals/${withdrawalId}/approve`,
      {},
      { headers: buildHeaders(req) }
    );
    return res.redirect("/withdrawals?message=Withdrawal approved successfully&type=success");
  } catch (error) {
    console.error("Withdrawal approval error:", error.message);
    const message = error.response?.data?.message || "Failed to approve withdrawal.";
    return res.redirect(`/withdrawals?message=${encodeURIComponent(message)}&type=error`);
  }
});

app.post("/withdrawals/:id/complete", ensureAuth, async (req, res) => {
  const withdrawalId = req.params.id;
  const notes = req.body.notes || "";
  try {
    await axios.patch(
      `${BASE_API_URL}/api/v1/admin/withdrawals/${withdrawalId}/complete`,
      { notes },
      { headers: buildHeaders(req) }
    );
    return res.redirect("/withdrawals?message=Withdrawal marked as completed&type=success");
  } catch (error) {
    console.error("Withdrawal completion error:", error.message);
    const message = error.response?.data?.message || "Failed to complete withdrawal.";
    return res.redirect(`/withdrawals?message=${encodeURIComponent(message)}&type=error`);
  }
});

app.post("/withdrawals/:id/reject", ensureAuth, async (req, res) => {
  const withdrawalId = req.params.id;
  const rejectionReason = req.body.rejectionReason;

  if (!rejectionReason) {
    return res.redirect(`/withdrawals?message=Rejection reason is required&type=error`);
  }

  try {
    await axios.patch(
      `${BASE_API_URL}/api/v1/admin/withdrawals/${withdrawalId}/reject`,
      { rejectionReason },
      { headers: buildHeaders(req) }
    );
    return res.redirect("/withdrawals?message=Withdrawal rejected successfully&type=success");
  } catch (error) {
    console.error("Withdrawal rejection error:", error.message);
    const message = error.response?.data?.message || "Failed to reject withdrawal.";
    return res.redirect(`/withdrawals?message=${encodeURIComponent(message)}&type=error`);
  }
});



app.post("/users/:userId/delete", ensureAuth, async (req, res) => {
  const { userId } = req.params;
  const hardDelete = req.query.hardDelete || req.body.hardDelete || "false";

  try {
    const endpoint = `${BASE_API_URL}/api/v1/admin/users/${userId}?hardDelete=${hardDelete}`;
    console.log(`\n🗑️ ========== DELETE USER REQUEST ==========`);
    console.log(`User ID: ${userId}`);
    console.log(`Hard Delete: ${hardDelete}`);
    console.log(`API URL: ${endpoint}`);
    console.log(`Headers:`, buildHeaders(req));

    const response = await axios.delete(
      endpoint,
      { headers: buildHeaders(req) }
    );

    console.log(`✅ Delete successful:`, response.data);
    console.log(`Status: ${response.status}`);
    console.log(`==========================================\n`);

    const deleteType = hardDelete === "true" ? "permanently deleted" : "deleted";
    return res.redirect(`/users?message=User ${deleteType} successfully&type=success`);
  } catch (error) {
    console.error(`\n❌ ========== DELETE USER ERROR ==========`);
    console.error(`User ID: ${userId}`);
    console.error(`Error Message:`, error.message);
    console.error(`Status Code:`, error.response?.status);
    console.error(`Response Data:`, error.response?.data);
    console.error(`Full Error:`, error.response || error);
    console.error(`==========================================\n`);

    const message = error.response?.data?.message || error.message || "Failed to delete user.";
    return res.redirect(`/users?message=${encodeURIComponent(message)}&type=error`);
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));

// Force keep-alive for debugging
setInterval(() => { }, 1000);
