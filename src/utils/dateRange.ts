export const getMonthRange = (month?: number, year?: number) => {
  const now = new Date();
  const targetMonth = typeof month === "number" ? month : now.getMonth();
  const targetYear = typeof year === "number" ? year : now.getFullYear();

  const start = new Date(targetYear, targetMonth, 1, 0, 0, 0, 0);
  const end = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

  return { start, end };
};
