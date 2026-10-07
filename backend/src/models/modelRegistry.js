const modelNames = [
  "AnnualReport","AviationPrice","Career","ContactMessage","Division","FuelPrice","FuelStation",
  "HistoricalPrice","HistoryPage","HomeService","ManagementContact","ManagementTeamMember",
  "MobileApp","News","Notice","PageContent","PageContentRevision","PopupNotice","PriceAudit","Project","RegionalOffice",
  "Service","SupplierResource","SupplierSection","Tender","TenderDownload","User",
];

const isSafeName = (name) => /^[A-Za-z][A-Za-z0-9_]{0,99}$/.test(name || "");

const tableName = (name) => {
  if (!isSafeName(name)) throw new Error(`Unsafe model name for table derivation: ${name}`);
  return `dbo.${name}Documents`;
};

module.exports = { modelNames, tableName, isSafeName };
