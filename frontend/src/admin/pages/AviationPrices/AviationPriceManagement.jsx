import ContentCrud from "../../components/ContentCrud";
import StatusBadge from "../../components/StatusBadge";
import { aviationPriceService } from "../../../services/contentService";

const columns = [
  { key: "customer", label: "Customer category" },
  { key: "location", label: "Location", className: "hidden sm:table-cell" },
  {
    key: "price",
    label: "Price (US$/USG)",
    render: (r) => (
      <span className="text-sm font-semibold text-[#092f3b]">
        {r.price ? `$${r.price}` : "—"}
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
  { key: "customer", label: "Customer Category", required: true, placeholder: "e.g. Spot / One Time Customer" },
  { key: "location", label: "Location", required: true, placeholder: "e.g. CMB / RML / HRI / JAF" },
  { key: "price", label: "Price (US$/USG)", type: "number", step: "0.01", required: true, placeholder: "e.g. 3.53" },
  { key: "effectiveDate", label: "Effective Date", type: "date" },
  { key: "status", label: "Status", type: "select", options: ["active", "inactive"], default: "active" },
];

const AviationPriceManagement = () => (
  <ContentCrud
    title="Aviation Prices"
    description="Manage contract customer aviation fuel prices shown on the Aviation page."
    service={aviationPriceService}
    columns={columns}
    fields={fields}
    emptyTitle="No aviation prices found"
    emptyHint="Add aviation fuel prices to get started"
    searchPlaceholder="Search customer or location..."
  />
);

export default AviationPriceManagement;
