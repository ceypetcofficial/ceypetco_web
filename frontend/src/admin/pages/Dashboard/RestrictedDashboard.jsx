import { ArrowUpRight, BriefcaseBusiness, ClipboardList, Droplets, Newspaper } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { accessForRole } from "../../roleAccess";

const roleLinks = {
  tender_user: [["/admin/tenders", "Tender Records", "Create, edit and remove tenders.", ClipboardList]],
  marketing_user: [
    ["/admin/fuel-prices", "Fuel Prices", "Manage current Marketing & Sales fuel prices.", Droplets],
    ["/admin/product-specification", "Product Specifications", "Upload and publish the product specification PDF.", ClipboardList],
  ],
  hr_user: [["/admin/careers", "Career Opportunities", "Create, edit and remove vacancies.", BriefcaseBusiness]],
  media_user: [
    ["/admin/news", "News Articles", "Manage website news articles.", Newspaper],
    ["/admin/notices", "Notices", "Manage public notices.", ClipboardList],
    ["/admin/projects", "Projects", "Manage media project content.", BriefcaseBusiness],
    ["/admin/publications", "Annual Reports", "Manage annual report publications.", ClipboardList],
    ["/admin/brochures", "Brochures", "Manage downloadable brochures.", ClipboardList],
    ["/admin/media", "Gallery Media", "Manage gallery images and videos.", Newspaper],
  ],
};

export default function RestrictedDashboard() {
  const { user } = useAuth();
  const access = accessForRole(user?.role);
  const links = roleLinks[user?.role] || [];
  return <div className="mx-auto max-w-6xl space-y-6">
    <section className="rounded-2xl bg-[#062e3b] p-7 text-white shadow-xl">
      <p className="text-xs font-extrabold uppercase tracking-[.16em] text-red-300">{access?.label} Dashboard</p>
      <h1 className="mt-2 text-3xl font-extrabold">Welcome, {user?.name}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">{access?.description} Your account is restricted to the tools shown below and cannot edit website pages or use the visual canvas.</p>
    </section>
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {links.map(([to,title,text,Icon])=><Link key={to} to={to} className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-red-300 hover:shadow-md">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#062e3b] text-white"><Icon size={21}/></span>
        <h2 className="mt-5 text-lg font-extrabold text-[#092f3b]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
        <span className="mt-5 inline-flex items-center gap-1 text-xs font-extrabold text-red-600">Open manager <ArrowUpRight size={14}/></span>
      </Link>)}
    </section>
  </div>;
}
