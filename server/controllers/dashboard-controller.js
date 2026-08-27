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
  const today = startOfDay(new Date());
  let periodStart = today;
  let periodEnd = endOfDay(today);
  let unit = "day";

  if (filter === "Harian") {
    const day = today.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    periodStart.setDate(today.getDate() + mondayOffset);
    periodEnd = endOfDay(new Date(periodStart));
    periodEnd.setDate(periodStart.getDate() + 6);
  } else if (filter === "Mingguan") {
    periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
    periodEnd = endOfDay(new Date(today.getFullYear(), today.getMonth() + 1, 0));
    unit = "week";
  } else if (filter === "Bulanan") {
    periodStart = new Date(today.getFullYear(), 0, 1);
    periodEnd = endOfDay(new Date(today.getFullYear(), 11, 31));
    unit = "month";
  } else if (filter === "Custom") {
    periodStart = startOfDay(start);
    periodEnd = endOfDay(end < periodStart ? periodStart : end);
  } else {
    throw new Error("Filter harus Harian, Mingguan, Bulanan, atau Custom.");
  }

  return { periodStart, periodEnd, unit };
}

function getBucket(date, unit) {
  if (unit === "month") return date.getMonth();
  if (unit === "week") return Math.floor((date.getDate() - 1) / 7);
  return formatDate(date);
}

function getBucketLabel(date, unit) {
  if (unit === "month") {
    return date.toLocaleDateString("id-ID", { month: "short" });
  }
  if (unit === "week") return `Minggu ${Math.floor((date.getDate() - 1) / 7) + 1}`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function summarize(rows, periodStart, periodEnd, unit) {
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

    const key = getBucket(invoice.date, unit);
    const bucket = buckets.get(key) || { date: invoice.date, amount: 0 };
    bucket.amount += invoice.amount;
    buckets.set(key, bucket);
  });

  const chart = [];
  const cursor = new Date(periodStart);
  while (cursor <= periodEnd) {
    const key = getBucket(cursor, unit);
    if (!chart.some((item) => item.key === key)) {
      chart.push({ key, label: getBucketLabel(cursor, unit), amount: buckets.get(key)?.amount || 0 });
    }
    cursor.setDate(cursor.getDate() + (unit === "month" ? 1 : 1));
  }

  if (unit === "week") chart.splice(4);
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

    const summary = summarize(rows, periodStart, periodEnd, unit);
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