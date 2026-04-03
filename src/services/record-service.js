import Record from "../models/recordModel.js";

const RECORD_TYPES = ["income", "expense"];


const create = async (data, user) => {
  const { amount, type, category, date, notes, currency } = data;
  const userId = user._id;

  if (amount == null || !type || !category || !date) {
    throw { status: 400, message: "Required fields missing" };
  }

  if (amount <= 0) {
    throw { status: 400, message: "Amount must be positive" };
  }

  const normalizedType = type.toLowerCase();

  if (!RECORD_TYPES.includes(normalizedType)) {
    throw { status: 400, message: "Invalid type" };
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate)) {
    throw { status: 400, message: "Invalid date" };
  }

  return await Record.create({
    amount,
    type: normalizedType,
    category,
    date: parsedDate,
    notes,
    currency,
    createdBy: userId
  });
};



const getRecords = async (user, query) => {
  const userId = user._id;
  if (!userId) throw { status: 400, message: "User ID is required" };

  const { type, category, startDate, endDate } = query;


  const filter = {
    createdBy: userId,
    isDeleted: false
  };

  if (type) {
    const normalizedType = type.toLowerCase();
    if (!RECORD_TYPES.includes(normalizedType)) {
      throw { status: 400, message: "Invalid type" };
    }
    filter.type = normalizedType;
  }

  if (category) filter.category = category;

  if (startDate || endDate) {
    filter.date = {};

    if (startDate) {
      const d = new Date(startDate);
      if (isNaN(d)) throw { status: 400, message: "Invalid start date" };
      filter.date.$gte = d;
    }

    if (endDate) {
      const d = new Date(endDate);
      if (isNaN(d)) throw { status: 400, message: "Invalid end date" };
      filter.date.$lte = d;
    }
  }

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;


  const records = await Record.find(filter)
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);


  const total = await Record.countDocuments(filter);

  return {
    records,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};


const update = async (recordId, data, user) => {
  const userId = user._id;
  if (!userId) throw { status: 400, message: "User ID is required" };

  const record = await Record.findOne({
    _id: recordId,
    createdBy: userId,
    isDeleted: false
  });

  if (!record) throw { status: 404, message: "Record not found" };

  const { amount, type, category, date, notes, currency } = data;

  if (amount != null) {
    if (amount <= 0) {
      throw { status: 400, message: "Amount must be positive" };
    }
    record.amount = amount;
  }

  if (type) {
    const normalizedType = type.toLowerCase();
    if (!RECORD_TYPES.includes(normalizedType)) {
      throw { status: 400, message: "Invalid type" };
    }
    record.type = normalizedType;
  }

  if (category) record.category = category;

  if (date) {
    const d = new Date(date);
    if (isNaN(d)) throw { status: 400, message: "Invalid date" };
    record.date = d;
  }

  if (notes !== undefined) record.notes = notes;
  if (currency) record.currency = currency;

  await record.save();
  return record;
};



const getById = async (recordId, user) => {
  const userId = user._id;
  if (!userId) throw { status: 400, message: "User ID is required" };

  const record = await Record.findOne({
    _id: recordId,
    createdBy: userId,
    isDeleted: false
  });

  if (!record) throw { status: 404, message: "Record not found" };

  return record;
};



const remove = async (recordId, user) => {
  const userId = user._id;
  if (!userId) throw { status: 400, message: "User ID is required" };

  const record = await Record.findOne({
    _id: recordId,
    createdBy: userId,
    isDeleted: false
  });

  if (!record) throw { status: 404, message: "Record not found" };

  record.isDeleted = true;
  await record.save();

  return { message: "Record deleted successfully" };
};


const Summary = async (userId) => {
  if (!userId) throw { status: 400, message: "User ID is required" };

  const summary = await Record.aggregate([
    { $match: { createdBy: userId, isDeleted: false } },
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: "$type",
              totalAmount: { $sum: "$amount" }
            }
          }
        ],
        categoryBreakdown: [
          {
            $group: {
              _id: "$category",
              totalAmount: { $sum: "$amount" }
            }
          }
        ]
      }
    }
  ]);

  const totals = summary[0].totals;

  let totalIncome = 0;
  let totalExpense = 0;

  totals.forEach(item => {
    if (item._id === "income") totalIncome = item.totalAmount;
    if (item._id === "expense") totalExpense = item.totalAmount;
  });

  const categoryBreakdown = {};
  summary[0].categoryBreakdown.forEach(item => {
    categoryBreakdown[item._id] = item.totalAmount;
  });

  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
    categoryBreakdown
  };
};


export {
  create,
  getRecords,
  update,
  getById,
  remove,
  Summary
};