export const formatAmount = (value: number) => `$${value.toFixed(2)}`;

export const formatCountPlus = (value: number) =>
  `${value.toLocaleString("en-US")}+`;
