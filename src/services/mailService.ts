import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";

export interface MailSummary {
  totalSpent: number;
  previousTotal: number;
  topCategories: { category: string; total: number }[];
  monthlyBudget: number;
  remainingBudget: number;
  periodLabel: string;
}

const formatBody = (userName: string, summary: MailSummary) => {
  const topCats = summary.topCategories
    .map((c) => `${c.category}: ${c.total.toFixed(2)}`)
    .join(", ") || "N/A";
  const delta = summary.totalSpent - summary.previousTotal;
  const direction = delta >= 0 ? "up" : "down";
  const deltaAbs = Math.abs(delta).toFixed(2);

  const html = `
    <p>Hi ${userName},</p>
    <p>Your ${summary.periodLabel} expense report is ready.</p>
    <ul>
      <li><strong>Total spent:</strong> ${summary.totalSpent.toFixed(2)}</li>
      <li><strong>Previous period:</strong> ${summary.previousTotal.toFixed(2)} (${direction} by ${deltaAbs})</li>
      <li><strong>Top categories:</strong> ${topCats}</li>
      <li><strong>Budget remaining:</strong> ${summary.remainingBudget.toFixed(2)} of ${summary.monthlyBudget.toFixed(2)}</li>
    </ul>
    <p>See attached CSV for full detail.</p>
  `;

  const text = `Hi ${userName},\n\n` +
    `Your ${summary.periodLabel} expense report is ready.\n` +
    `Total spent: ${summary.totalSpent.toFixed(2)}\n` +
    `Previous period: ${summary.previousTotal.toFixed(2)} (${direction} by ${deltaAbs})\n` +
    `Top categories: ${topCats}\n` +
    `Budget remaining: ${summary.remainingBudget.toFixed(2)} of ${summary.monthlyBudget.toFixed(2)}\n\n` +
    `See attached CSV for full detail.`;

  return { html, text, topCats };
};

const sendWithSendGrid = async (params: {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  csvBuffer: Buffer;
  periodLabel: string;
}) => {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) return false;
  sgMail.setApiKey(apiKey);
  await sgMail.send({
    to: params.to,
    from: params.from,
    subject: params.subject,
    text: params.text,
    html: params.html,
    attachments: [
      {
        content: params.csvBuffer.toString("base64"),
        filename: `expenses-${params.periodLabel.replace(/\s+/g, "-")}.csv`,
        type: "text/csv",
        disposition: "attachment",
      },
    ],
  });
  return true;
};

const sendWithSmtp = async (params: {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  csvBuffer: Buffer;
  periodLabel: string;
}) => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    throw new Error("SMTP configuration is missing (SMTP_HOST, SMTP_USER, SMTP_PASS)");
  }
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  await transporter.sendMail({
    from: params.from,
    to: params.to,
    subject: params.subject,
    text: params.text,
    html: params.html,
    attachments: [
      {
        filename: `expenses-${params.periodLabel.replace(/\s+/g, "-")}.csv`,
        content: params.csvBuffer,
      },
    ],
  });
  return true;
};

export const sendReportEmail = async (params: {
  to: string;
  userName: string;
  summary: MailSummary;
  csvBuffer: Buffer;
}) => {
  const { to, userName, summary, csvBuffer } = params;
  const from =
    process.env.SMTP_FROM || process.env.SENDGRID_FROM || process.env.SMTP_USER || "reports@example.com";

  const { html, text } = formatBody(userName, summary);
  const subject = `Expense report - ${summary.periodLabel}`;

  // Prefer SendGrid if API key is present; fall back to SMTP.
  if (process.env.SENDGRID_API_KEY) {
    await sendWithSendGrid({ from, to, subject, html, text, csvBuffer, periodLabel: summary.periodLabel });
    return;
  }

  await sendWithSmtp({ from, to, subject, html, text, csvBuffer, periodLabel: summary.periodLabel });
};
