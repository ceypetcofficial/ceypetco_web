import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Fuel, LayoutDashboard, FileText, Wrench, Droplets, MapPin, Building2, Mail, Users, ChevronDown, ChevronRight, X, Newspaper, ClipboardList, BadgeAlert, Megaphone, Layers, Smartphone, Home, Compass, Contact, Settings, GraduationCap, BookOpen, FolderOpen, Images as ImagesIcon } from "lucide-react";

const page=(path)=>`/admin/pages?path=${encodeURIComponent(path)}`;
const navigation=[
  {text:"Home",icon:Home,items:[
    [page("/"),"Home Page",FileText],["/admin/home","Services & Resources",Layers],["/admin/popup-notices","Popup Notices",Megaphone],
  ]},
  {text:"Discover",icon:Compass,items:[
    [page("/about"),"About Us",FileText],[page("/management"),"Management Page",Users],["/admin/team-members","Management Team",Users],["/admin/about","Management Contacts",Contact],[page("/history"),"Our History",BookOpen],["/admin/history","Timeline & Gallery",BookOpen],[page("/subsidiaries"),"Subsidiaries",Building2],[page("/energy-ministries"),"Related Ministries",Building2],
  ]},
  {text:"Services",icon:Wrench,items:[
    [page("/services"),"All Services",FileText],["/admin/services-page","Service Cards",Wrench],["/admin/services-page/divisions","Division Pages",Layers],[page("/refinery"),"Refinery",Building2],[page("/marketing-sales"),"Marketing & Sales",Droplets],[page("/aviation"),"Ceypetco Aviation",Layers],[page("/agro-chemicals"),"Agro Chemicals",Layers],[page("/lubricants"),"Ceypetco Lubricants",Droplets],[page("/services/marine-bunkering"),"Marine Bunkering",Layers],[page("/electric-mobility"),"Electric Mobility",Layers],["/admin/mobile-apps","Mobile Apps",Smartphone],["/admin/fuel-prices","Fuel Prices",Droplets],["/admin/aviation-prices","Aviation Prices",Layers],["/admin/historical-prices","Historical Prices",BookOpen],["/admin/fuel-stations","Fuel Stations",MapPin],["/admin/regional-offices","Regional Offices",Building2],
  ]},
  {text:"Media",icon:Newspaper,items:[
    [page("/news"),"News Page",FileText],["/admin/news","News Articles",Newspaper],[page("/notices"),"Notices Page",FileText],["/admin/notices","Notices",BadgeAlert],[page("/projects"),"Projects Page",FileText],["/admin/projects","Projects",FolderOpen],    [page("/annual-reports"),"Publications Page",FileText],["/admin/publications","Annual Reports",BookOpen],
  ]},
  {text:"Tenders",icon:ClipboardList,items:[
    [page("/tenders"),"Tenders Page",FileText],["/admin/tenders","Tender Records",ClipboardList],["/admin/tender-downloads","Tender Downloads",ClipboardList],["/admin/supplier-resources","Supplier Resources",FileText],
  ]},
  {text:"Careers",icon:GraduationCap,items:[
    [page("/careers"),"Careers Page",FileText],["/admin/careers","Current Opportunities",GraduationCap],
  ]},
  {text:"Contact",icon:Contact,items:[
    [page("/contact"),"Contact Page",FileText],["/admin/messages","Contact Messages",Mail],
  ]},
  {text:"System",icon:Settings,items:[
    ["/admin/users","Users & Roles",Users],
  ]},
];

function ChildLink({item,onClose}){const location=useLocation();const [to,text,Icon]=item;const target=new URL(to,"http://admin.local");const active=location.pathname===target.pathname&&(!target.search||location.search===target.search);return <NavLink to={to} onClick={onClose} className={`admin-sidebar-link flex items-center gap-3 py-2.5 pl-11 pr-3 mx-2 rounded-lg border text-[13px] font-semibold ${active?"admin-sidebar-link-active shadow-md shadow-black/20":""}`}><Icon size={16}/><span>{text}</span></NavLink>}
function Group({group,onClose}){const location=useLocation();const active=group.items.some(([to])=>{const target=new URL(to,"http://admin.local");return location.pathname===target.pathname&&(!target.search||location.search===target.search)});const [open,setOpen]=useState(active);return <div><button onClick={()=>setOpen(v=>!v)} className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-bold ${active?"bg-white/10 text-white":"text-slate-200 hover:bg-white/5"}`}><group.icon size={18} className="text-red-400"/><span className="flex-1 text-left">{group.text}</span>{open?<ChevronDown size={15}/>:<ChevronRight size={15}/>}</button>{open&&<div className="py-1 bg-black/10 max-h-80 overflow-y-auto">{group.items.map(item=><ChildLink key={item[0]+item[1]} item={item} onClose={onClose}/>)}</div>}</div>}

export default function AdminSidebar({isOpen,onClose}){const {user}=useAuth();return <>{isOpen&&<div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose}/>}<aside className={`admin-sidebar fixed top-0 left-0 h-full w-[270px] bg-[#062e3b] z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${isOpen?"translate-x-0":"-translate-x-full"}`}><div className="h-[72px] flex items-center justify-between px-5 border-b border-white/10"><div className="flex items-center gap-3"><span className="w-9 h-9 bg-white rounded-full flex items-center justify-center"><Fuel size={18} className="text-red-600"/></span><div><h1 className="text-white font-extrabold text-sm tracking-wider">CEYPETCO</h1><p className="text-[9px] text-slate-400 tracking-[.13em] uppercase font-bold">Website Editor</p></div></div><button onClick={onClose} className="lg:hidden text-white"><X size={20}/></button></div><nav className="flex-1 overflow-y-auto py-3"><NavLink to="/admin" end onClick={onClose} className={({isActive})=>`admin-sidebar-link flex items-center gap-3 px-5 py-3 mx-2 mb-2 rounded-lg border text-sm font-bold ${isActive?"admin-sidebar-link-active":""}`}><LayoutDashboard size={19}/><span>Dashboard</span></NavLink><NavLink to="/admin/media" onClick={onClose} className={({isActive})=>`admin-sidebar-link flex items-center gap-3 px-5 py-3 mx-2 mb-2 rounded-lg border text-sm font-bold ${isActive?"admin-sidebar-link-active":""}`}><ImagesIcon size={19}/><span>Image Library</span></NavLink><p className="px-5 py-2 text-[10px] font-extrabold tracking-[.16em] text-slate-400 uppercase">Website navigation</p>{navigation.map(group=><Group key={group.text} group={group} onClose={onClose}/>)}</nav><div className="border-t border-white/10 p-2"><p className="px-3 text-[9px] text-slate-500 truncate">Signed in as {user?.name}</p></div></aside></>}
