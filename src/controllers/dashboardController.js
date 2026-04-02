import {
    getSummary,
    getCategoryBreakdown,
    getMonthlyTrends,
    getRecentRecords
} from "../services/dashboard-service.js";

const getDashboardData = async (req, res) => {
    try {
        const userId = req.user._id;

        const summary = await getSummary(userId);
        const categoryBreakdown = await getCategoryBreakdown(userId);
        const monthlyTrends = await getMonthlyTrends(userId);
        const recentRecords = await getRecentRecords(userId);

        return res.status(200).json({
            success: true,
            data: {
                summary,
                categoryBreakdown,
                monthlyTrends,
                recentRecords
            }
        });

    }
    catch (error) {
        console.error("Error fetching dashboard data:", error);
        return res.status(500).json({ message: "Failed to fetch dashboard data", error: error.message });
    }
}