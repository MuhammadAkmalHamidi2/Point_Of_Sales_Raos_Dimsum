const { Op } = require("sequelize");
const { penjualan: Penjualan, Outlet } = require("../models");

function startOfDay(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfDay(date) {
  const result = startOfDay(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(value, fallback) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return fallback;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

function getPeriod(filter, start, end) {
  const today = new Date();
  let periodStart = startOfDay(today);
  let periodEnd = endOfDay(today);
  let unit = "day";

  if (filter === "Harian") {
    // Hari Ini (00:00 s/d 23:59)
    periodStart = startOfDay(today);
    periodEnd = endOfDay(today);
    unit = "hour";
  } else if (filter === "Mingguan") {
    // Minggu Ini (Senin s/d Minggu)
    const day = today.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    periodStart = startOfDay(today);
    periodStart.setDate(today.getDate() + mondayOffset);
    const sunday = new Date(periodStart);
    sunday.setDate(periodStart.getDate() + 6);
    periodEnd = endOfDay(sunday);
    unit = "day";
  } else if (filter === "Bulanan") {
    // Bulan Ini (Tanggal 1 s/d akhir bulan)
    periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
    periodEnd = endOfDay(new Date(today.getFullYear(), today.getMonth() + 1, 0));
    unit = "week";
  } else if (filter === "Custom") {
    periodStart = startOfDay(start);
    periodEnd = endOfDay(end < periodStart ? periodStart : end);
    const diffTime = Math.abs(periodEnd - periodStart);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    unit = diffDays > 31 ? "month" : "day";
  } else {
    throw new Error("Filter harus Harian, Mingguan, Bulanan, atau Custom.");
  }

  return { periodStart, periodEnd, unit };
}

function summarize(rows, periodStart, periodEnd, unit, filter) {
  const invoices = new Map();
  rows.forEach((row) => {
    if (!invoices.has(row.invoice)) {
      invoices.set(row.invoice, {
        amount: Number(row.totalBayar) || 0,
        payment: String(row.metodePembayaran || "").toLowerCase(),
        date: new Date(row.createdAt),
      });
    }
  });

  const summary = { totalOmset: 0, cashAmount: 0, qrisAmount: 0 };
  const buckets = new Map();

  invoices.forEach((invoice) => {
    summary.totalOmset += invoice.amount;
    if (invoice.payment === "cash") summary.cashAmount += invoice.amount;
    if (invoice.payment === "qris") summary.qrisAmount += invoice.amount;

    let key;
    const date = invoice.date;
    if (unit === "hour") {
      const hour = date.getHours();
      let slotHour = Math.floor((hour - 8) / 2) * 2 + 8;
      if (slotHour < 8) slotHour = 8;
      if (slotHour > 20) slotHour = 20;
      key = `${String(slotHour).padStart(2, "0")}:00`;
    } else if (unit === "day") {
      key = formatDate(date);
    } else if (unit === "week") {
      key = Math.min(Math.floor((date.getDate() - 1) / 7), 3);
    } else {
      key = formatDate(date);
    }

    buckets.set(key, (buckets.get(key) || 0) + invoice.amount);
  });

  let chart = [];

  if (filter === "Harian" || unit === "hour") {
    const hours = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];
    chart = hours.map((h) => ({
      label: h,
      amount: buckets.get(h) || 0,
    }));
  } else if (filter === "Mingguan" || unit === "day") {
    const cursor = new Date(periodStart);
    while (cursor <= periodEnd) {
      const k = formatDate(cursor);
      const label = cursor.toLocaleDateString("id-ID", { weekday: "short" });
      chart.push({
        label,
        amount: buckets.get(k) || 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
  } else if (filter === "Bulanan" || unit === "week") {
    const weekLabels = ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"];
    chart = weekLabels.map((label, idx) => ({
      label,
      amount: buckets.get(idx) || 0,
    }));
  } else {
    const cursor = new Date(periodStart);
    while (cursor <= periodEnd) {
      const k = formatDate(cursor);
      chart.push({
        label: cursor.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
        amount: buckets.get(k) || 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  const maxAmount = Math.max(...chart.map((item) => item.amount), 0);
  return {
    ...summary,
    cashPercent: summary.totalOmset ? Math.round((summary.cashAmount / summary.totalOmset) * 100) : 0,
    qrisPercent: summary.totalOmset ? Math.round((summary.qrisAmount / summary.totalOmset) * 100) : 0,
    chart: chart.map((item) => ({
      label: item.label,
      val: maxAmount ? Math.round((item.amount / maxAmount) * 100) : 0,
      amount: item.amount,
    })),
  };
}

async function getDashboard(req, res) {
  try {
    const filter = req.query.filter || "Harian";
    const customStart = parseDate(req.query.start, new Date());
    const customEnd = parseDate(req.query.end, customStart);
    const { periodStart, periodEnd, unit } = getPeriod(filter, customStart, customEnd);

    const outletWhere = req.user.role === "master" ? {} : { userId: req.user.id };
    const outlets = await Outlet.findAll({ where: outletWhere, attributes: ["id"] });
    const outletIds = outlets.map((outlet) => outlet.id);
    const rows = outletIds.length
      ? await Penjualan.findAll({
          where: {
            outletId: { [Op.in]: outletIds },
            createdAt: { [Op.between]: [periodStart, periodEnd] },
          },
          attributes: ["invoice", "totalBayar", "metodePembayaran", "createdAt"],
          order: [["createdAt", "ASC"]],
        })
      : [];

    const summary = summarize(rows, periodStart, periodEnd, unit, filter);
    return res.status(200).json({
      status: true,
      message: "Berhasil mengambil data dashboard",
      data: {
        filter,
        startDate: formatDate(periodStart),
        endDate: formatDate(periodEnd),
        ...summary,
      },
    });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
}

module.exports = { getDashboard };