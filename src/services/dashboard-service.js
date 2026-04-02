import Record from "../models/recordModel.js";


const getSummary = async (userId) => {
    try {
        if (!userId) throw new Error("User ID is required");

        const results = await Record.aggregate([
            {
                $match: {
                    createdBy: userId,
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
                    createdBy: userId,
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

export const getMonthlyTrends = async (userId) => {
    try {
        const results = await Record.aggregate([
            {
                $match: {
                    createdBy: userId,
                    isDeleted: false,
                },
            },
            {
                $group: {
                    _id: { $month: "$date" },
                    total: { $sum: "$amount" },
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
                    total: 1,
                },
            },
        ]);

        return results.map(item => ({
            month: item.month,
            totalAmount: item.total,
        }));
    }
    catch (error) {
        throw error;
    }
};

const getRecentRecords = async (userId) => {
    try {
        const records = await Record.find({ createdBy: userId, isDeleted: false })
            .sort({ date: -1 })
            .limit(5);

        return records;
    }
    catch (error) {
        throw error;
    }
}


export default {
    getSummary,
    getCategoryBreakdown,
    getMonthlyTrends,
    getRecentRecords
}
