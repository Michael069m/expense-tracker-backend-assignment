import cron from "node-cron";
import User from "./models/user";
import { generateUserReport } from "./services/reportService";
import { sendReportEmail } from "./services/mailService";

const runReportsForAllUsers = async () => {
  const users = await User.find({}, { _id: 1, email: 1, name: 1 });
  for (const user of users) {
    try {
      const report = await generateUserReport(user.id);
      await sendReportEmail({
        to: report.userEmail,
        userName: report.userName,
        summary: {
          totalSpent: report.totalSpent,
          previousTotal: report.previousTotal,
          topCategories: report.topCategories,
          monthlyBudget: report.monthlyBudget,
          remainingBudget: report.remainingBudget,
          periodLabel: report.periodLabel,
        },
        csvBuffer: report.csvBuffer,
      });
    } catch (err) {
      console.error(`Failed to send report for user ${user.id}`, err);
    }
  }
};

export const startSchedulers = () => {
  // 1st of every month at 06:00 UTC
  cron.schedule("0 6 1 * *", () => {
    void runReportsForAllUsers();
  });

  // January 1st at 07:00 UTC (annual run)
  cron.schedule("0 7 1 1 *", () => {
    void runReportsForAllUsers();
  });
};
