import ContentCrud from "../../components/ContentCrud";
import StatusBadge from "../../components/StatusBadge";
import { fuelPriceService } from "../../../services/contentService";

const columns = [
  { key: "product", label: "Product" },
  { key: "category", label: "Category", className: "hidden sm:table-cell" },
  { key: "type", label: "Type", className: "hidden lg:table-cell" },
  {
    key: "price",
    label: "Price",
    render: (r) => (
      <span className="text-sm font-semibold text-[#092f3b]">
        {r.price ? `LKR ${r.price.toLocaleString()}` : "—"}
      </span>
    ),
  },
  {
    key: "effectiveDate",
    label: "Effective Date",
    className: "hidden md:table-cell",
    render: (r) =>
      r.effectiveDate ? (
        <span className="text-xs text-[#66767d]">
          {new Date(r.effectiveDate).toLocaleDateString()}
        </span>
      ) : (
        "—"
      ),
  },
  {
    key: "status",
    label: "Status",
    render: (r) => <StatusBadge status={r.status} />,
  },
];

const fields = [
  { key: "product", label: "Product Name", required: true, placeholder: "e.g. Lanka Lubricant 20W50" },
  {
    key: "category",
    label: "Category",
    type: "select",
    options: ["White Oil", "Black Oil", "Lubricants", "Aviation Fuel"],
    default: "White Oil",
  },
  {
    key: "type",
    label: "Type",
    type: "select",
    options: ["fuel", "lubricant", "aviation", "other"],
    default: "fuel",
  },
  { key: "price", label: "Price (LKR)", type: "number", required: true, min: 0, max: 1000000, step: "0.01" },
  { key: "unit", label: "Unit", default: "LKR" },
  { key: "effectiveDate", label: "Effective Date", type: "date" },
  { key: "status", label: "Status", type: "select", options: ["active", "inactive"], default: "active" },
];

const FuelPriceManagement = () => (
  <ContentCrud
    title="Fuel Prices"
    description="Manage current fuel and product prices — including lubricants, aviation and other fuels."
    service={fuelPriceService}
    columns={columns}
    fields={fields}
    emptyTitle="No fuel prices found"
    emptyHint="Add fuel and product prices to get started"
    searchPlaceholder="Search products..."
  />
);

export default FuelPriceManagement;
