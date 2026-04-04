import mongoose from "mongoose";
import Record from "../models/recordModel.js";


const getSummary = async (userId) => {
    try {
        if (!userId) throw new Error("User ID is required");

        const results = await Record.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    isDeleted: false,
                }
            },
            {
                $group: {
                    _id: "$type",
                    totalAmount: { $sum: "$amount" },
                }
            }
        ])


        let income = 0, expense = 0;

        results.forEach(item => {
            if (item._id === "income") income = item.totalAmount;
            else if (item._id === "expense") expense = item.totalAmount;
        })

        return {
            totalIncome: income,
            totalExpense: expense,
            netBalance: income - expense,
        }
    } catch (error) {
        throw error;
    }
}

const getCategoryBreakdown = async (userId) => {
    try {
        if (!userId) throw new Error("User ID is required");

        const results = await Record.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    isDeleted: false,
                }
            },
            {
                $group: {
                    _id: "$category",
                    totalAmount: { $sum: "$amount" },
                }
            },
            {
                $sort: { totalAmount: -1 }
            }
        ])

        return results.map(item => ({
            category: item._id,
            totalAmount: item.totalAmount,
        }))
    }
    catch (error) {
        throw error;
    }
}

const getMonthlyTrends = async (userId) => {
    try {
        const results = await Record.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    isDeleted: false,
                },
            },

            {
                $group: {
                    _id: {
                        month: { $month: "$date" },
                        type: "$type",
                    },
                    totalAmount: { $sum: "$amount" },
                },
            },

            {
                $group: {
                    _id: "$_id.month",
                    totals: {
                        $push: {
                            type: "$_id.type",
                            amount: "$totalAmount",
                        },
                    },
                },
            },

            {
                $sort: { _id: 1 },
            },

            {
                $project: {
                    _id: 0,
                    month: {
                        $arrayElemAt: [
                            [
                                "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                            ],
                            "$_id"
                        ],
                    },
                    totals: 1,
                },
            },
        ]);

        // Step 5: Transform response
        return results.map((item) => ({
            month: item.month,
            totalIncome:
                item.totals.find((t) => t.type === "income")?.amount || 0,
            totalExpense:
                item.totals.find((t) => t.type === "expense")?.amount || 0,
        }));
    } catch (error) {
        throw error;
    }
};

const getRecentRecords = async (userId) => {
    try {
        const records = await Record.find({ userId: new mongoose.Types.ObjectId(userId), isDeleted: false })
            .sort({ date: -1 })
            .limit(5);

        return records;
    }
    catch (error) {
        throw error;
    }
}

export {
    getSummary,
    getCategoryBreakdown,
    getMonthlyTrends,
    getRecentRecords
}
