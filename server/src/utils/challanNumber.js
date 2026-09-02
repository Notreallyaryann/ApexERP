import prisma from '../config/prisma.js';

/**
 * Generate a sequential, unique Challan Number in format CH-YYYYMM-XXXX
 * e.g., CH-202609-0001
 */
export async function generateChallanNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `CH-${year}${month}-`;

  // Find highest existing challan number with this prefix
  const latestChallan = await prisma.salesChallan.findFirst({
    where: {
      challanNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      challanNumber: 'desc',
    },
    select: {
      challanNumber: true,
    },
  });

  let nextSequence = 1;
  if (latestChallan && latestChallan.challanNumber) {
    const parts = latestChallan.challanNumber.split('-');
    if (parts.length === 3) {
      const parsedSeq = parseInt(parts[2], 10);
      if (!isNaN(parsedSeq)) {
        nextSequence = parsedSeq + 1;
      }
    }
  }

  const sequenceStr = String(nextSequence).padStart(4, '0');
  return `${prefix}${sequenceStr}`;
}
