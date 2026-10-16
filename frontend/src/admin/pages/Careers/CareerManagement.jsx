import ContentCrud from "../../components/ContentCrud";
import StatusBadge from "../../components/StatusBadge";
import { careerService } from "../../../services/contentService";
import { FileText } from "lucide-react";
import displayImageUrl from "../../../utils/displayImageUrl.js";

const columns = [
  { key: "title", label: "Position", className: "max-w-xs" },
  { key: "department", label: "Department", className: "hidden lg:table-cell" },
  { key: "location", label: "Location", className: "hidden md:table-cell" },
  {
    key: "applicationDeadline",
    label: "Deadline",
    className: "hidden sm:table-cell",
    render: (r) =>
      r.applicationDeadline ? (
        <span className="text-xs text-[#66767d]">
          {new Date(r.applicationDeadline).toLocaleDateString()}
        </span>
      ) : (
        "—"
      ),
  },
  {
    key: "document",
    label: "Document",
    className: "hidden lg:table-cell",
    render: (record) => record.document ? <a href={displayImageUrl(record.document)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600"><FileText className="h-3.5 w-3.5"/>View file</a> : "—",
  },
  {
    key: "status",
    label: "Status",
    render: (r) => <StatusBadge status={r.status} />,
  },
];

const fields = [
  { key: "title", label: "Position Title", required: true },
  { key: "department", label: "Department" },
  { key: "location", label: "Location" },
  { key: "type", label: "Employment Type", type: "select", options: ["Full-time", "Part-time", "Contract", "Internship"] },
  { key: "salary", label: "Salary", placeholder: "e.g. LKR 75,000" },
  { key: "status", label: "Status", type: "select", options: ["draft", "open", "closed"], default: "draft" },
  { key: "publishedDate", label: "Published Date", type: "date" },
  { key: "applicationDeadline", label: "Application Deadline", type: "date" },
  { key: "description", label: "Job Description", type: "textarea", fullWidth: true },
  { key: "requirements", label: "Requirements", type: "textarea", fullWidth: true },
  { key: "responsibilities", label: "Responsibilities", type: "textarea", fullWidth: true },
  { key: "document", label: "Vacancy Document", type: "document", accept: "application/pdf,.pdf,.doc,.docx", placeholder: "Upload the vacancy PDF or enter a public URL", fullWidth: true },
];

const CareerManagement = () => (
  <ContentCrud
    title="Careers Management"
    description="Create and manage job vacancies advertised by CEYPETCO."
    service={careerService}
    columns={columns}
    fields={fields}
    emptyTitle="No vacancies found"
    emptyHint="Create your first vacancy to get started"
    searchPlaceholder="Search vacancies..."
  />
);

export default CareerManagement;
