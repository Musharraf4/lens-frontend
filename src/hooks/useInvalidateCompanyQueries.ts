import { QueryClient } from "@tanstack/react-query";

export const invalidateCompanyQueries = (queryClient: QueryClient) => {
  const keys = [
    "companyUsers",
    "companyInvoice",
    "companyDetail",
    "companyDetails",
    "companyChargeDate",
    "awaitingUsers",
    "checkPlanUsed",
  ];

  keys.forEach((key) => {
    queryClient.invalidateQueries({ queryKey: [key] });
  });
};
