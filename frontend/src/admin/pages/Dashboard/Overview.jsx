import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import {
  ArrowUpRight, CheckCircle2, Edit3, Eye, FileText, Globe2,
  Image as ImageIcon, Loader2, MessageSquare, Newspaper, RefreshCw,
  Rocket, Search, X,
} from "lucide-react";
import toast from "react-hot-toast";
import snapshotLivePage from "../../../utils/snapshotLivePage";
import displayImageUrl from "../../../utils/displayImageUrl";

const fallbackImages={
  "/":"/images/hero.png","/about":"/images/about-banner.webp","/history":"/images/history-1.jpg",
  "/services":"/images/distribution.jpg","/products":"/images/lubricants-hero.jpg","/management":"/images/management-energy-leadership.webp",
  "/subsidiaries":"/images/subsidiaries-petroleum-storage.webp","/energy-ministries":"/images/related-ministries-hero-v2.webp",
  "/marketing-sales":"/images/distribution.jpg","/refinery":"/images/refinery.png","/aviation":"/images/aviation-aircraft-refuelling.jpg",
  "/agro-chemicals":"/images/agro-hero.webp","/lubricants":"/images/lubricants-hero.jpg","/services/marine-bunkering":"/images/bunkering/marine-bunkering-hero.webp",
  "/electric-mobility":"/images/operations/ev-charging.jpg","/news":"/images/news-hero-v2.webp","/notices":"/images/notices-hero-v2.webp",
    "/tenders":"/images/tenders-hero.webp","/projects":"/images/refinery-card-1.jpg","/careers":"/images/career-team.jpg",
  "/annual-reports":"/images/publications-hero-v2.webp","/contact":"/images/head-office.webp",
  "/gallery":"/images/aviation-hero.jpg",
  "/media":"/images/media-1.jpg","/publications":"/images/publications-hero-v2.webp","/regional-offices":"/images/head-office.webp",
  "/right-to-information":"/images/head-office.webp","/mobile-app":"/images/distribution.jpg","/corporate-life":"/images/head-office.webp",
  "/current-opportunities":"/images/career-team.jpg",
};;
const categories=[
  ["Main",["/","/about","/history"]],["Services",["/services","/products","/marketing-sales","/refinery","/aviation","/agro-chemicals","/lubricants","/services/marine-bunkering","/electric-mobility"]],
  ["Media",["/news","/notices","/projects","/annual-reports","/media","/publications","/gallery","/mobile-app"]],["Corporate",["/management","/subsidiaries","/energy-ministries","/tenders","/careers","/contact","/regional-offices","/right-to-information","/corporate-life","/current-opportunities"]],
];
const knownPages = [["Home","/"],["About","/about"],["History","/history"],["Services","/services"],["Products","/products"],["Management","/management"],["Subsidiaries","/subsidiaries"],["Related Ministries","/energy-ministries"],["Marketing & Sales","/marketing-sales"],["Refinery","/refinery"],["Aviation","/aviation"],["Agro Chemicals","/agro-chemicals"],["Lubricants","/lubricants"],["Marine Bunkering","/services/marine-bunkering"],["Electric Mobility","/electric-mobility"],["News","/news"],["Notices","/notices"],["Tenders","/tenders"],["Projects","/projects"],["Careers","/careers"],["Annual Reports","/annual-reports"],["Gallery","/gallery"],["Contact","/contact"],["Media Centre","/media"],["Publications","/publications"],["Regional Offices","/regional-offices"],["Right to Information","/right-to-information"],["Mobile App","/mobile-app"],["Corporate Life","/corporate-life"],["Current Opportunities","/current-opportunities"]];
const emptyManaged={hero:{eyebrow:"",title:"",subtitle:"",image:"",imageAlt:"",buttonText:"",buttonLink:""},sections:[],overrides:[]};

export default function Overview(){
  const {user}=useAuth();
  const [records,setRecords]=useState([]),[gallery,setGallery]=useState([]),[galleryTotal,setGalleryTotal]=useState(0),[loading,setLoading]=useState(true),[query,setQuery]=useState(""),[category,setCategory]=useState("All"),[preview,setPreview]=useState(null),[publishing,setPublishing]=useState(""),[publishingAll,setPublishingAll]=useState(false),[live,setLive]=useState({});
  const load=async()=>{setLoading(true);try{const [pageResponse,galleryResponse]=await Promise.all([api.get("/admin/pages"),api.get("/admin/gallery",{params:{limit:8}})]);setRecords(pageResponse.data.data||[]);setGallery(galleryResponse.data.data||[]);setGalleryTotal(galleryResponse.data.pagination?.total||0);}catch{toast.error("Could not load dashboard content");}finally{setLoading(false);}};
  useEffect(()=>{load();},[]);
  useEffect(()=>{
    let active=true;
    if(!records.length)return undefined;
    const pending=knownPages.map(([,p])=>p).filter(p=>!records.some(r=>r.path===p));
    if(!pending.length)return undefined;
    (async()=>{
      const results={};
      await Promise.all(pending.map(async p=>{try{const snap=await snapshotLivePage(p);if(snap&&active)results[p]={hero:snap.hero,sections:snap.sections};}catch{/* keep fallback */}}));
      if(active)setLive(results);
    })();
    return ()=>{active=false;};
  },[records]);
  const directory=useMemo(()=>{const known=knownPages.map(([name,path])=>{const managed=records.find(p=>p.path===path);return managed?{...managed,key:path,name:managed.name||name}:{key:path,name,path,status:"live",...emptyManaged};});const covered=new Set(known.map(p=>p.key));return [...known,...records.filter(r=>!covered.has(r.path)).map(r=>({...r,key:r.path}))];},[records]);
  const paths=category==="All"?null:categories.find(([name])=>name===category)?.[1];
  const filtered=useMemo(()=>directory.filter(page=>(!paths||paths.includes(page.path))&&(!query||`${page.name} ${page.path}`.toLowerCase().includes(query.toLowerCase()))),[directory,paths,query]);
  const published=records.filter(p=>p.status==="published").length;
  const drafts=records.filter(p=>p.status==="draft").length;
  const snapshotPublish=async page=>{
    toast.loading(`Snapshotting the live ${page.name} page from the current website...`,{id:`snap-${page.key}`});
    const snapshot=await snapshotLivePage(page.path);
    toast.dismiss(`snap-${page.key}`);
    const hero={...emptyManaged.hero,...page.hero};let sections=page.sections||[];
    if(snapshot){
      if(snapshot.hero.title)hero.title=snapshot.hero.title;
      if(snapshot.hero.subtitle)hero.subtitle=snapshot.hero.subtitle;
      if(snapshot.hero.image)hero.image=snapshot.hero.image;
      if(snapshot.sections?.length)sections=snapshot.sections;
    }
    const payload={name:page.name,path:page.path,status:"published",hero,sections,overrides:page.overrides||[]};
    if(page._id)await api.put(`/admin/pages/${page._id}`,payload);else await api.post("/admin/pages",payload);
  };
  const togglePublish=async page=>{
    const next=page.status==="published"?"draft":"published";
    setPublishing(page.key);
    try{
      if(next==="published")await snapshotPublish(page);
      else{const payload={name:page.name,path:page.path,status:next,hero:page.hero||emptyManaged.hero,sections:page.sections||[],overrides:page.overrides||[]};if(page._id)await api.put(`/admin/pages/${page._id}`,payload);}
      await load();
      toast.success(next==="published"?"Page published from the live website":"Page returned to draft");
    }catch(e){toast.error(e.response?.data?.message||"Publishing failed");}
    finally{setPublishing("");}
  };
  const publishAll=async()=>{
    const list=directory;
    if(!confirm(`Snapshot the live website and publish/refresh all ${list.length} pages with their current content and images?`))return;
    setPublishingAll(true);
    let done=0,failed=0;
    try{
      for(const page of list){
        toast.loading(`Publishing ${page.name} (${done+1}/${list.length})...`,{id:"publish-all"});
        try{await snapshotPublish(page);done++;}
        catch(e){failed++;toast.error(`Failed to publish ${page.name}: ${e.response?.data?.message||e.message}`);}
      }
      await load();
    }finally{
      toast.dismiss("publish-all");
      setPublishingAll(false);
      toast.success(`Published ${done} pages`+(failed?` (${failed} failed)`:""));
    }
  };
  const imageFor=page=>{const h=page.status==="live"?live[page.key]?.hero?.image:page.hero?.image;return h||fallbackImages[page.path]||"/images/about-banner.webp"};
  return <div className="space-y-7 max-w-[1500px] mx-auto">
    <section className="relative overflow-hidden rounded-2xl bg-[#062e3b] text-white p-6 lg:p-8 shadow-xl shadow-slate-300/30"><div className="absolute -right-20 -top-24 w-80 h-80 rounded-full bg-red-600/20 blur-3xl"/><div className="relative flex flex-col xl:flex-row xl:items-end justify-between gap-6"><div><p className="text-[11px] font-extrabold tracking-[.16em] text-red-300 uppercase">CEYPETCO Publishing Studio</p><h1 className="mt-2 text-3xl lg:text-4xl font-extrabold tracking-tight">Welcome, {user?.name||"Administrator"}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">Preview the current public website, open any page visually, edit its complete content and publish when it is ready.</p></div><div className="flex flex-wrap gap-3"><a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold hover:bg-white/15"><Globe2 size={17}/>Open live website<ArrowUpRight size={15}/></a><Link to="/admin/pages" className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold hover:bg-red-500"><Edit3 size={17}/>Create a page</Link></div></div></section>

    <section className="grid grid-cols-2 lg:grid-cols-5 gap-4"><Metric icon={Globe2} label="Website pages" value={directory.length}/><Metric icon={Rocket} label="Managed & published" value={published} accent/><Metric icon={FileText} label="Draft pages" value={drafts}/><Metric icon={ImageIcon} label="Pages with hero images" value={directory.filter(p=>{const h=p.status==="live"?live[p.key]?.hero?.image:p.hero?.image;return h||fallbackImages[p.path]}).length}/><Metric icon={ImageIcon} label="Gallery media" value={galleryTotal}/></section>

    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"><div className="p-5 border-b border-slate-200 flex items-center justify-between gap-4"><div><p className="text-[10px] font-extrabold tracking-[.14em] text-red-600 uppercase">Media gallery</p><h2 className="text-xl font-extrabold text-[#092f3b] mt-1">Recent gallery items</h2></div><Link to="/admin/media" className="gallery-dashboard-action inline-flex items-center justify-center gap-2 rounded-lg bg-[#062e3b] px-4 py-2.5 text-sm font-bold shadow-sm transition hover:bg-[#0a4657]" style={{color:"#fff"}}>Manage gallery <ArrowUpRight size={15} color="#fff"/></Link></div><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 p-5">{gallery.length?gallery.map(item=><Link to="/admin/media" key={item._id} className="group min-w-0"><img src={displayImageUrl(item.type==="video"?item.posterUrl:item.mediaUrl)} alt="" className="w-full aspect-square object-cover rounded-lg bg-slate-100"/><strong className="block text-xs text-[#092f3b] truncate mt-2">{item.title}</strong><span className="block text-[10px] text-slate-500 truncate">{item.category}</span></Link>):<p className="col-span-full py-6 text-sm text-slate-500 text-center">No gallery items yet. Open the gallery manager to add one.</p>}</div></section>

    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"><div className="p-5 lg:p-6 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4"><div><p className="text-[10px] font-extrabold tracking-[.14em] text-red-600 uppercase">Live website</p><h2 className="text-xl font-extrabold text-[#092f3b] mt-1">Current website preview</h2><p className="text-xs text-slate-500 mt-1">Browse the actual website below. Select another page from the cards to preview it.</p></div><div className="flex items-center gap-2"><span className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-full"><span className="w-2 h-2 rounded-full bg-emerald-500"/>Live</span><button onClick={()=>setPreview(p=>({...p,_reload:Date.now()}))} className="p-2.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900"><RefreshCw size={17}/></button></div></div><div className="bg-slate-100 p-3 lg:p-5"><div className="rounded-xl overflow-hidden border border-slate-300 bg-white shadow-lg"><div className="h-10 bg-slate-50 border-b flex items-center gap-2 px-4"><i className="w-2.5 h-2.5 bg-red-400 rounded-full"/><i className="w-2.5 h-2.5 bg-amber-400 rounded-full"/><i className="w-2.5 h-2.5 bg-emerald-400 rounded-full"/><div className="mx-auto w-1/2 bg-white border rounded-md px-3 py-1 text-[10px] text-slate-500 truncate">{window.location.origin}{preview?.path||"/"}</div></div><iframe key={`${preview?.path||"/"}-${preview?._reload||0}`} src={preview?.path||"/"} title="Current website preview" className="w-full h-[520px] bg-white"/></div></div></section>

    <section><div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 mb-5"><div><p className="text-[10px] font-extrabold tracking-[.14em] text-red-600 uppercase">Page directory</p><h2 className="text-2xl font-extrabold text-[#092f3b] mt-1">Edit and publish website pages</h2></div><div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search pages..." className="w-full sm:w-72 rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2.5 text-sm outline-none focus:border-red-500"/></div><button disabled={publishingAll} onClick={()=>publishAll()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#062e3b] text-white px-4 py-2.5 text-sm font-bold hover:bg-[#0a4251] disabled:opacity-50 disabled:cursor-not-allowed">{publishingAll?<Loader2 size={16} className="animate-spin"/>:<Rocket size={16}/>}Publish all from live site</button></div></div><div className="flex flex-wrap gap-2 mb-5">{["All",...categories.map(x=>x[0])].map(name=><button key={name} onClick={()=>setCategory(name)} className={`px-4 py-2 rounded-full text-xs font-extrabold transition ${category===name?"bg-[#062e3b] text-white":"bg-white border border-slate-200 text-slate-600 hover:border-slate-400"}`}>{name}</button>)}</div>
      {loading?<div className="py-20 flex justify-center"><Loader2 className="animate-spin text-red-600"/></div>:<div className="grid md:grid-cols-2 2xl:grid-cols-3 gap-5">{filtered.map(page=><article key={page.key} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all"><div className="relative"><button onClick={()=>setPreview(page)} className="relative block w-full h-48 overflow-hidden bg-slate-200 text-left"><img src={imageFor(page)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/><span className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent"/><span className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${page.status==="published"?"bg-emerald-500 text-white":page.status==="draft"?"bg-amber-400 text-amber-950":"bg-slate-500 text-white"}`}>{page.status==="live"?"On live site":page.status}</span><span className="absolute bottom-3 left-4 right-4 text-white"><strong className="block text-lg font-extrabold">{page.name}</strong><small className="text-white/70">{page.path}</small></span></button><a href={page.path} target="_blank" rel="noreferrer" title={`Open ${page.name} on the website`} className="absolute top-3 left-3 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/90 text-[#062e3b] shadow hover:bg-white"><ArrowUpRight size={15}/></a></div><div className="p-4"><div className="flex items-center justify-between text-xs text-slate-500 mb-4"><span>{page.status==="live"?(live[page.key]?`${live[page.key].sections.length} content sections`:"Finding live content…"):`${page.sections?.length||0} content sections`}</span><span>{page.status==="live"?(live[page.key]?.hero?.image?"Live hero":"Original hero"):(page.hero?.image?"Custom hero":"Default hero")}</span></div><div className="grid grid-cols-3 gap-2"><button onClick={()=>setPreview(page)} className="inline-flex justify-center items-center gap-1.5 rounded-lg border border-slate-200 px-2 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"><Eye size={15}/>Preview</button><Link to={`/admin/pages?path=${encodeURIComponent(page.path)}`} className="inline-flex justify-center items-center gap-1.5 rounded-lg border border-slate-200 px-2 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"><Edit3 size={15}/>Edit</Link><button disabled={publishing===page.key||publishingAll} onClick={()=>togglePublish(page)} className={`inline-flex justify-center items-center gap-1 rounded-lg px-2 py-2.5 text-xs font-bold text-white disabled:opacity-50 ${page.status==="published"?"bg-slate-600":"bg-red-600 hover:bg-red-500"}`}>{publishing===page._id?<Loader2 className="animate-spin" size={14}/>:page.status==="published"?<><X size={14}/>Unpublish</>:<><Rocket size={14}/>Publish</>}</button></div></div></article>)}</div>}
    </section>

    <section className="grid lg:grid-cols-3 gap-4"><Quick icon={Newspaper} title="News publishing" text="Create articles, upload lead images and publish media updates." to="/admin/news"/><Quick icon={MessageSquare} title="Public enquiries" text="Review messages submitted through the contact page." to="/admin/messages"/><Quick icon={CheckCircle2} title="SQL content storage" text="Page content and publishing status are saved in SQL Server." to="/admin/pages"/></section>
  </div>;
}

const Metric=({icon:Icon,label,value,accent})=><div className={`rounded-xl border p-4 ${accent?"bg-red-600 border-red-600 text-white":"bg-white border-slate-200 text-[#092f3b]"}`}><div className="flex items-start justify-between"><div><p className={`text-[11px] font-bold ${accent?"text-white/70":"text-slate-500"}`}>{label}</p><strong className="block text-3xl mt-2 font-extrabold">{value}</strong></div><span className={`p-2 rounded-lg ${accent?"bg-white/15":"bg-slate-100"}`}><Icon size={19}/></span></div></div>;
const Quick=({icon:Icon,title,text,to})=><Link to={to} className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-red-300 hover:shadow-md transition"><span className="w-10 h-10 rounded-lg bg-[#062e3b] text-white flex items-center justify-center"><Icon size={19}/></span><h3 className="font-extrabold text-[#092f3b] mt-4">{title}</h3><p className="text-xs text-slate-500 mt-1 leading-5">{text}</p><span className="inline-flex items-center gap-1 mt-4 text-xs font-bold text-red-600">Open manager <ArrowUpRight size={14}/></span></Link>;
