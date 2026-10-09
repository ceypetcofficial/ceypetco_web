import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, Copy, Database, Eye, GripVertical, Image, Monitor, Plus, Save, Smartphone, Tablet, Trash2, X } from "lucide-react";
import api from "../../../services/api";
import toast from "react-hot-toast";

const blockTypes=[
  ["content","Text Section","Heading and rich paragraph content"],
  ["split","Image + Text","Two-column image and editorial copy"],
  ["cards","Card Grid","Reusable feature or service cards"],
  ["stats","Statistics","Prominent figures and labels"],
  ["cta","Call to Action","Conversion-focused closing banner"],
];
const pageManagers={
  "/":[["Home services","/admin/home"],["News","/admin/news"],["Popup notices","/admin/popup-notices"],["Fuel prices","/admin/fuel-prices"],["Fuel stations","/admin/fuel-stations"],["Service divisions","/admin/services-page/divisions"]],
  "/about":[["Management contacts","/admin/about"]],
  "/management":[["Management team","/admin/team-members"],["Management contacts","/admin/about"]],
  "/history":[["History timeline & gallery","/admin/history"]],
  "/services":[["Services","/admin/services-page"],["Service divisions","/admin/services-page/divisions"],["Regional offices","/admin/regional-offices"]],
  "/marketing-sales":[["Fuel prices","/admin/fuel-prices"],["Historical prices","/admin/historical-prices"],["Fuel stations","/admin/fuel-stations"],["Service divisions","/admin/services-page/divisions"]],
  "/marketing-sales/historical-prices":[["Fuel prices","/admin/fuel-prices"],["Historical prices","/admin/historical-prices"]],
  "/news":[["News articles","/admin/news"]],
  "/notices":[["Notices","/admin/notices"]],
  "/media":[["News articles","/admin/news"],["Notices","/admin/notices"],["Annual reports","/admin/publications"]],
  "/gallery":[["Gallery media","/admin/media"]],
  "/tenders":[["Tenders","/admin/tenders"],["Supplier resources","/admin/supplier-resources"]],
  "/projects":[["Projects","/admin/projects"]],
  "/careers":[["Career opportunities","/admin/careers"]],
  "/corporate-life":[["Career opportunities","/admin/careers"]],
  "/current-opportunities":[["Career opportunities","/admin/careers"]],
  "/annual-reports":[["Annual reports","/admin/publications"]],
  "/publications":[["Annual reports","/admin/publications"]],
  "/contact":[["Contact messages","/admin/messages"],["Regional offices","/admin/regional-offices"]],
  "/regional-offices":[["Regional offices","/admin/regional-offices"]],
  "/mobile-app":[["Mobile apps","/admin/mobile-apps"]],
  "/agro-chemicals":[["Service divisions","/admin/services-page/divisions"],["Agro Chemicals division","/admin/services-page/divisions/agro-chemicals"]],
  "/aviation":[["Service divisions","/admin/services-page/divisions"],["Aviation division","/admin/services-page/divisions/aviation"]],
  "/refinery":[["Service divisions","/admin/services-page/divisions"],["Refinery division","/admin/services-page/divisions/refinery"]],
  "/lubricants":[["Service divisions","/admin/services-page/divisions"],["Lubricants division","/admin/services-page/divisions/lubricants"]],
};
const blank=type=>({id:crypto.randomUUID(),type,eyebrow:"SECTION LABEL",title:`New ${blockTypes.find(x=>x[0]===type)?.[1]||"Section"}`,body:"Click this text to replace it with your content.",image:"",imageAlt:"",buttonText:"",buttonLink:"",items:type==="cards"?[{title:"Card title",text:"Card description",image:""}]:type==="stats"?[{title:"100+",text:"Statistic label",image:""}]:[]});
const Editable=({value,onChange,as="div",className="",placeholder="Click to edit"})=>{const Tag=as;return <Tag className={`${className} outline-none rounded focus:ring-2 focus:ring-red-400/70 focus:ring-offset-4 empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400`} contentEditable suppressContentEditableWarning data-placeholder={placeholder} onBlur={e=>onChange(e.currentTarget.innerText)}>{value}</Tag>};

const cardFields=card=>{
  const title=card.querySelector("h1,h2,h3,h4,strong")?.textContent?.trim()||"",
    text=[...card.querySelectorAll("p")].filter(p=>!p.classList.contains("eyebrow")).map(p=>p.textContent.trim()).find(Boolean)||"",
    category=card.querySelector(".eyebrow")?.textContent?.trim()||"Public Services",
    link=card.matches("a")?(card.getAttribute("href")||""):(card.querySelector("a[href]")?.getAttribute("href")||""),
    image=card.querySelector("img")?.getAttribute("src")||"";
  return {title,text,category,link,image,status:"published"};
};
const homeCardFields=card=>{
  const title=card.querySelector("h3,h4,strong")?.textContent?.trim()||"",
    text=[...card.querySelectorAll("p")].filter(p=>!p.classList.contains("eyebrow")).map(p=>p.textContent.trim()).find(Boolean)||"",
    link=card.getAttribute("href")||"",
    icon=card.getAttribute("data-icon")||"globe";
  return {title,text,link,icon,description:text,status:"published"};
};
const teamCardFields=card=>{
  const name=card.querySelector("h3")?.textContent?.trim()||card.querySelector("figcaption")?.textContent?.trim()||"",
    role=card.querySelector("figcaption, .team-member-role")?.textContent?.trim()||"",
    description=card.querySelector(".team-member-desc")?.textContent?.replace(/\s+/g," ").trim()||"",
    photo=card.querySelector(".team-member-photo img")?.getAttribute("src")||"";
  return {name,role,description,photo,status:"published"};
};
const readTeamMember=async fields=>{
  try{
    const {data}=await api.get("/admin/team-members",{params:{limit:200}});
    const list=data?.data||[];
    const name=(fields.name||fields.title||"").trim();
    return list.find(item=>item.name===name)||list.find(item=>item.role===fields.role)||null;
  }catch{return null;}
};
const findRecordForCard=async(endpoint,fields)=>{
  try{
    const {data}=await api.get(endpoint,{params:{limit:200}});
    const list=data?.data||[];
    const match=fields.link&&fields.link!=="#"?list.find(item=>item.title===fields.title&&item.link===fields.link):null;
    return match||list.find(item=>item.title===fields.title)||null;
  }catch{return null;}
};
const nextOrder=async endpoint=>{
  try{
    const {data}=await api.get(endpoint,{params:{limit:500}});
    return Math.max(0,...(data?.data||[]).map(item=>Number(item.order??0)))+1;
  }catch{return 0;}
};
const GRID_MODELS=[
  {grid:grid=>grid?.classList?.contains("directory-grid"),label:"Service",endpoint:"/admin/services",read:fields=>findRecordForCard("/admin/services",fields),fields:cardFields},
  {grid:grid=>grid?.classList?.contains("home-services-grid"),label:"Home service",endpoint:"/admin/home-services",read:fields=>findRecordForCard("/admin/home-services",fields),fields:homeCardFields},
  {grid:grid=>grid?.classList?.contains("management-team-rows"),label:"Management team",endpoint:"/admin/team-members",read:fields=>readTeamMember(fields),fields:teamCardFields},
];
const gridModelFor=grid=>GRID_MODELS.find(model=>grid&&model.grid(grid));
const syncGridOrder=async grid=>{
  const model=gridModelFor(grid);
  if(!model)return;
  const cards=[...grid.children].filter(child=>child.dataset.cmsCard==="true");
  for(let index=0;index<cards.length;index++){
    const record=await model.read(model.fields(cards[index]));
    if(record&&Number(record.order??0)!==index)api.put(`${model.endpoint}/${record._id}`,{order:index}).catch(()=>{});
  }
};

export default function VisualPageEditor({form,setForm,save,upload,saving,canPublish,onBack,currentFrameRef,importCurrentPage}){
  const [device,setDevice]=useState("desktop"),[showBlocks,setShowBlocks]=useState(false),[mode,setMode]=useState("actual"),[dragging,setDragging]=useState(null),[actualEditing,setActualEditing]=useState(false),[actualReload,setActualReload]=useState(0),[managerOpen,setManagerOpen]=useState(false),[managerUrl,setManagerUrl]=useState("canvas"),[canvasCards,setCanvasCards]=useState([]),[cardEditor,setCardEditor]=useState(null),[cardKind,setCardKind]=useState("");
  const fileRefs=useRef({});
  const editingCardRef=useRef(null);
  const recordIdRef=useRef(null);
  const hero=(key,value)=>setForm(f=>({...f,hero:{...f.hero,[key]:value}}));
  const change=(index,key,value)=>setForm(f=>({...f,sections:f.sections.map((s,i)=>i===index?{...s,[key]:value}:s)}));
  const add=type=>{setForm(f=>({...f,sections:[...f.sections,blank(type)]}));setShowBlocks(false);setMode("edit");};
  const remove=index=>setForm(f=>({...f,sections:f.sections.filter((_,i)=>i!==index)}));
  const duplicate=index=>setForm(f=>{const sections=[...f.sections];sections.splice(index+1,0,{...sections[index],id:crypto.randomUUID(),items:(sections[index].items||[]).map(x=>({...x}))});return{...f,sections}});
  const move=(index,to)=>setForm(f=>{if(to<0||to>=f.sections.length)return f;const sections=[...f.sections],[item]=sections.splice(index,1);sections.splice(to,0,item);return{...f,sections}});
  const drop=to=>{if(dragging==null)return;move(dragging,to);setDragging(null)};
  const width=device==="desktop"?"100%":device==="tablet"?"820px":"390px";
  const actualPageUrl=`${form.path||"/"}${(form.path||"/").includes("?")?"&":"?"}cmsPreview=original&editorReload=${actualReload}`;
  const openActualWebsite=()=>{setActualEditing(false);setActualReload(value=>value+1);setMode("actual")};
  const openComponentCanvas=()=>{setActualEditing(false);setActualReload(value=>value+1);setMode("edit")};
  const managers=pageManagers[form.path]||[];
  const refreshCanvasCards=()=>{const doc=currentFrameRef.current?.contentDocument;setCanvasCards([...doc?.querySelectorAll("main [data-cms-card]")||[]].map((card,index)=>({index,title:card.querySelector("h1,h2,h3,h4,strong")?.textContent?.trim()||`Card ${index+1}`,description:card.querySelector("p")?.textContent?.trim()||""})))};
  const scheduleCanvasRefresh=()=>[250,650,1200,2000].forEach(delay=>setTimeout(refreshCanvasCards,delay));
  const reloadCanvasFrame=()=>{const win=currentFrameRef.current?.contentWindow;if(!win)return;if(win.document.readyState==="complete")scheduleCanvasRefresh();win.location.reload()};
  const openManager=(url="canvas")=>{setManagerUrl(url);setManagerOpen(true);scheduleCanvasRefresh()};
  const canvasCardAction=(index,action)=>{const doc=currentFrameRef.current?.contentDocument,card=doc?.querySelectorAll("main [data-cms-card]")?.[index];if(!card)return;const buttons=[...card.querySelectorAll(":scope > [data-cms-card-toolbar] button")];buttons.find(button=>button.textContent===action)?.click();setTimeout(refreshCanvasCards,100)};
  const openCardDetails=card=>{editingCardRef.current=card;recordIdRef.current=null;const title=card.querySelector("h1,h2,h3,h4,strong"),description=[...card.querySelectorAll("p")].filter(p=>!p.classList.contains("eyebrow"))[0],link=card.matches("a")?card:card.querySelector("a[href]"),image=card.querySelector("img"),action=[...card.querySelectorAll("span,b,small")].find(el=>/access|view|read|learn|explore|service/i.test(el.textContent||""));setCardEditor({title:title?.textContent?.trim()||"",description:description?.textContent?.trim()||"",link:link?.getAttribute("href")||"",actionText:action?.textContent?.trim()||"Access service",image:image?.getAttribute("src")||""});const model=gridModelFor(card.parentElement);setCardKind(model?.label||"generic");if(model)model.read(model.fields(card)).then(record=>{recordIdRef.current=record?._id||null})};
  const saveCardDetails=()=>{const card=editingCardRef.current;if(!card||!cardEditor)return;const title=card.querySelector("h1,h2,h3,h4,strong"),description=[...card.querySelectorAll("p")].filter(p=>!p.classList.contains("eyebrow"))[0],image=card.querySelector("img"),action=[...card.querySelectorAll("span,b,small")].find(el=>/access|view|read|learn|explore|service/i.test(el.textContent||""));if(title)title.textContent=cardEditor.title;if(description)description.textContent=cardEditor.description;card.querySelectorAll("a[href]").forEach(a=>a.setAttribute("href",cardEditor.link||"#"));if(action)action.textContent=cardEditor.actionText;if(image&&cardEditor.image)image.setAttribute("src",cardEditor.image);const model=gridModelFor(card.parentElement);if(model){const base=model.fields(card);const payload=cardKind==="Management team"?{name:cardEditor.title,role:base.role||"",description:cardEditor.description,photo:cardEditor.image||base.photo||"",status:"published"}:{...base,title:cardEditor.title,text:cardEditor.description,description:cardEditor.description,link:cardEditor.link||"#",image:cardEditor.image||base.image||""};const request=recordIdRef.current?api.put(`${model.endpoint}/${recordIdRef.current}`,payload):api.post(model.endpoint,payload);request.then(()=>{toast.success(`${model.label} updated`);reloadCanvasFrame()}).catch(err=>toast.error(`Could not save card: ${err?.response?.data?.message||err.message}`));}else currentFrameRef.current?._saveCmsContainer?.(card.parentElement);setCardEditor(null);setCardKind("");editingCardRef.current=null;recordIdRef.current=null;setTimeout(refreshCanvasCards,50)};
  useEffect(()=>{setMode("actual");setActualEditing(false);setActualReload(value=>value+1)},[form.path]);
  const enableActualEditing=()=>{
    const frame=currentFrameRef.current;
    const doc=frame?.contentDocument;
    if(!doc?.body){setTimeout(enableActualEditing,200);return;}
    let style=doc.getElementById("ceypetco-visual-editor-style");
    if(!style){
      style=doc.createElement("style");
      style.id="ceypetco-visual-editor-style";
      style.textContent=`main [data-cms-editable=true]{outline:1px dashed rgba(220,38,38,.65)!important;outline-offset:3px;cursor:text!important;border-radius:2px;min-width:12px}main [data-cms-editable=true]:hover,main [data-cms-editable=true]:focus{outline:3px solid #dc2626!important;background:rgba(255,255,255,.12)!important}main section[data-visual-section]{position:relative;outline:1px dashed rgba(220,38,38,.18)}main img[data-visual-image]{cursor:pointer!important;outline:2px dashed rgba(220,38,38,.65)!important;outline-offset:2px}[data-cms-card]{position:relative!important}[data-cms-card]:hover>[data-cms-ui]{display:flex!important}[data-cms-ui]{font-family:Arial,sans-serif!important}[data-cms-card-toolbar]{display:none!important;position:absolute!important;z-index:999998!important;top:8px!important;right:8px!important;gap:4px!important;background:#062e3b!important;padding:5px!important;border-radius:8px!important;box-shadow:0 8px 24px #0004!important}[data-cms-ui] button{all:unset!important;box-sizing:border-box!important;cursor:pointer!important;color:white!important;background:#173f4a!important;padding:7px 10px!important;border-radius:5px!important;font:700 11px Arial!important}[data-cms-ui] button:hover{background:#d71920!important}[data-cms-add]{position:absolute!important;z-index:999997!important;right:8px!important;bottom:8px!important;display:flex!important}[data-cms-drop-line]{position:absolute!important;z-index:999999!important;height:4px!important;border-radius:4px!important;background:#d71920!important;box-shadow:0 0 0 2px #fff,0 4px 12px #0005!important;pointer-events:none!important}[data-cms-card].cms-dragging{opacity:.45!important;pointer-events:none!important}body.cms-drag-active *{cursor:grabbing!important;user-select:none!important}`;
      doc.head.appendChild(style);
    }
    const decorate=()=>{
      const selectorFor=element=>{const parts=[];let node=element;while(node&&node.tagName&&node.tagName.toLowerCase()!=="main"){const tag=node.tagName.toLowerCase();const siblings=[...(node.parentElement?.children||[])].filter(item=>item.tagName===node.tagName);parts.unshift(`${tag}:nth-of-type(${siblings.indexOf(node)+1})`);node=node.parentElement}return `main>${parts.join(">")}`};
      const stripEditorUi=node=>{node.querySelectorAll("[data-cms-ui]").forEach(ui=>ui.remove());node.querySelectorAll("[data-cms-editable]").forEach(el=>{el.removeAttribute("data-cms-editable");el.removeAttribute("data-cms-dirty");el.removeAttribute("contenteditable");el.removeAttribute("tabindex");el.removeAttribute("spellcheck")});node.querySelectorAll("[data-cms-card]").forEach(el=>el.removeAttribute("data-cms-card"));node.querySelectorAll("[data-visual-image]").forEach(el=>{el.removeAttribute("data-visual-image");el.removeAttribute("title")})};
      const persistContainer=container=>{const clone=container.cloneNode(true);stripEditorUi(clone);const selector=selectorFor(container),html=clone.innerHTML;setForm(current=>({...current,overrides:[...(current.overrides||[]).filter(item=>item.selector!==selector&&!item.selector.startsWith(`${selector}>`)),{selector,html}]}))};
      frame._saveCmsContainer=persistContainer;
      let lastDropIndex=null;
      const beginCardDrag=(card,event)=>{
        const grid=card.parentElement;
        if(!grid)return;
        const startX=event.clientX,startY=event.clientY;
        let dragging=false;
        const cards=()=>[...grid.children].filter(child=>child.dataset.cmsCard==="true");
        const indicator=doc.createElement("div");indicator.dataset.cmsUi="true";indicator.dataset.cmsDropLine="true";indicator.hidden=true;
        grid.style.position=grid.style.position||"relative";
        grid.appendChild(indicator);
        const dropIndexFor=(x,y)=>{
          const list=cards(),others=list.filter(item=>item!==card);
          if(!others.length)return 0;
          let index=0;
          for(const item of others){
            const rect=item.getBoundingClientRect(),midX=rect.left+rect.width/2,midY=rect.top+rect.height/2;
            if(y>midY+1||(y>=rect.top-1&&y<=rect.bottom+1&&x>=midX))index++;
          }
          return index;
        };
        const showIndicatorAt=index=>{
          const list=cards(),gridRect=grid.getBoundingClientRect();
          let left=gridRect.left,width=gridRect.width,top=gridRect.top;
          if(list.length){
            if(index<=0){const rect=list[0].getBoundingClientRect();left=rect.left;width=rect.width;top=rect.top;}
            else if(index>=list.length){const rect=list[list.length-1].getBoundingClientRect();left=rect.left;width=rect.width;top=rect.bottom;}
            else{const rect=list[index].getBoundingClientRect();left=rect.left;width=rect.width;top=rect.top;}
          }
          const pad=4;
          indicator.style.left=`${left-gridRect.left-pad}px`;
          indicator.style.top=`${top-gridRect.top-pad}px`;
          indicator.style.width=`${width+pad*2}px`;
          indicator.hidden=false;
        };
        const move=event=>{
          if(!dragging){
            if(Math.abs(event.clientX-startX)+Math.abs(event.clientY-startY)<6)return;
            dragging=true;
            card.classList.add("cms-dragging");
            doc.body.classList.add("cms-drag-active");
          }
          event.preventDefault();event.stopPropagation();
          lastDropIndex=dropIndexFor(event.clientX,event.clientY);
          showIndicatorAt(lastDropIndex);
        };
        const end=()=>{
          doc.removeEventListener("pointermove",move);
          doc.removeEventListener("pointerup",end);
          doc.removeEventListener("pointercancel",end);
          indicator.hidden=true;indicator.remove();
          card.classList.remove("cms-dragging");
          doc.body.classList.remove("cms-drag-active");
          if(!dragging)return;
          const list=cards(),index=Math.min(Math.max(0,lastDropIndex??0),list.length);
          const anchor=index>=list.length?null:list[index];
          if(anchor===card)return;
          grid.insertBefore(card,anchor);
          if(gridModelFor(grid)){syncGridOrder(grid);toast.success("Order updated");}
          else persistContainer(grid);
          setTimeout(refreshCanvasCards,50);
        };
        try{card.setPointerCapture(event.pointerId)}catch{}
        doc.addEventListener("pointermove",move,{passive:false});
        doc.addEventListener("pointerup",end);
        doc.addEventListener("pointercancel",end);
      };
      doc.querySelectorAll("main h1,main h2,main h3,main h4,main p,main li,main a,main button,main span:not(.icon):not([aria-hidden=true])").forEach(el=>{
        if(el.dataset.cmsEditable==="true"||el.closest("[data-cms-ui]"))return;
        el.dataset.cmsEditable="true";
        el.contentEditable="true";
        el.spellcheck=true;
        el.tabIndex=0;
        el.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();el.focus()});
        el.addEventListener("input",()=>{el.dataset.cmsDirty="true"});
        el.addEventListener("blur",()=>{if(el.dataset.cmsDirty!=="true")return;const selector=selectorFor(el),clone=el.cloneNode(true);stripEditorUi(clone);const html=clone.innerHTML;delete el.dataset.cmsDirty;setForm(current=>({...current,overrides:[...(current.overrides||[]).filter(item=>item.selector!==selector),{selector,html}]}))});
      });
      doc.querySelectorAll("main article,main a[class*='card'],main .team-row").forEach(card=>{
        if(card.dataset.cmsCard==="true"||card.closest("[data-cms-ui]")||card.closest("main [data-cms-card]"))return;
        card.dataset.cmsCard="true";
        const toolbar=doc.createElement("div");toolbar.dataset.cmsUi="true";toolbar.dataset.cmsCardToolbar="true";
        const detailsButton=doc.createElement("button");detailsButton.type="button";detailsButton.textContent="Edit details";
        const dragButton=doc.createElement("button");dragButton.type="button";dragButton.textContent="Drag";dragButton.dataset.cmsDragHandle="true";dragButton.style.cursor="grab";
        const duplicateButton=doc.createElement("button");duplicateButton.type="button";duplicateButton.textContent="Duplicate";
        const deleteButton=doc.createElement("button");deleteButton.type="button";deleteButton.textContent="Delete";
        detailsButton.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();openCardDetails(card)});
        dragButton.addEventListener("pointerdown",event=>{event.preventDefault();event.stopPropagation();beginCardDrag(card,event)});
        duplicateButton.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();const parent=card.parentElement,model=gridModelFor(parent);if(model){const fields=model.fields(card),text=fields.text||"Click to edit this card description";api.post(model.endpoint,{...fields,title:`${fields.title} (Copy)`,text,status:"published"}).then(()=>{toast.success(`${model.label} duplicated`);reloadCanvasFrame()}).catch(err=>toast.error(`Could not duplicate: ${err?.response?.data?.message||err.message}`));return;}const copy=card.cloneNode(true);stripEditorUi(copy);copy.removeAttribute("data-cms-card");parent.insertBefore(copy,card.nextSibling);decorate();persistContainer(parent);setTimeout(refreshCanvasCards,50)});
        deleteButton.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();const parent=card.parentElement,model=gridModelFor(parent);if(model){model.read(model.fields(card)).then(record=>{if(record)return api.delete(`${model.endpoint}/${record._id}`).then(()=>{toast.success(`${model.label} removed`);reloadCanvasFrame()});card.remove();persistContainer(parent);setTimeout(refreshCanvasCards,50)}).catch(err=>toast.error(`Could not delete: ${err?.response?.data?.message||err.message}`));return;}card.remove();persistContainer(parent);setTimeout(refreshCanvasCards,50)});
        toolbar.append(detailsButton,dragButton,duplicateButton,deleteButton);card.appendChild(toolbar);
      });
      const ADD_SECTIONS=[
  {kind:"home-service",find:d=>d.querySelector(".home-services-grid"),buttonLabel:"+ Add service",manager:"Home services",url:"/admin/home"},
  {kind:"service",find:d=>d.querySelector(".directory-grid"),buttonLabel:"+ Add service",manager:"Services",url:"/admin/services-page"},
  {kind:"news",find:d=>{const g=d.querySelector(".news-grid");return g&&!g.closest(".media-page")?g:null},buttonLabel:"+ Add news",manager:"News articles",url:"/admin/news"},
  {kind:"project",find:d=>d.querySelector(".media-page .news-grid"),buttonLabel:"+ Add project",manager:"Projects",url:"/admin/projects"},
  {kind:"notice",find:d=>d.querySelector(".notices-page .notice-document-grid"),buttonLabel:"+ Add notice",manager:"Notices",url:"/admin/notices"},
  {kind:"tender",find:d=>{const lists=d.querySelectorAll(".tenders-hub .tender-list");return lists.length?lists[lists.length-1]:null},buttonLabel:"+ Add tender",manager:"Tenders",url:"/admin/tenders"},
  {kind:"report",find:d=>d.querySelector(".annual-report-grid")||d.querySelector(".annual-reports-page .annual-report-featured"),buttonLabel:"+ Add report",manager:"Annual reports",url:"/admin/publications"},
  {kind:"team-member",find:d=>d.querySelector(".management-team-section .management-team-rows"),buttonLabel:"+ Add team member",manager:"Management team",url:"/admin/team-members"},
  {kind:"supplier-resource",find:d=>d.querySelector(".supplier-registration-panel .supplier-resource-grid"),buttonLabel:"+ Add supplier resource",manager:"Supplier resources",url:"/admin/supplier-resources"},
  {kind:"regional-office",find:d=>d.querySelector(".regional-office-grid"),buttonLabel:"+ Add regional office",manager:"Regional offices",url:"/admin/regional-offices"},
  {kind:"mobile-app",find:d=>d.querySelector(".mobile-apps-grid"),buttonLabel:"+ Add app",manager:"Mobile apps",url:"/admin/mobile-apps"},
  {kind:"career",find:d=>d.querySelector(".career-vacancy-list"),buttonLabel:"+ Add vacancy",manager:"Career opportunities",url:"/admin/careers"},
];
ADD_SECTIONS.forEach(section=>{
  const grid=section.find(doc);
  if(!grid||!grid.isConnected)return;
  const marker=`cms-add-${section.kind}`;
  if(grid.parentNode?.querySelector(`:scope > [data-cms-add-button="${marker}"]`))return;
  const wrap=doc.createElement("div");wrap.dataset.cmsAddButton=marker;wrap.style.cssText="display:flex!important;justify-content:center!important;width:100%!important";
  const btn=doc.createElement("button");btn.type="button";btn.textContent=section.buttonLabel;btn.title=`Open ${section.manager} in the admin panel`;btn.style.cssText="display:inline-flex!important;align-items:center!important;gap:7px!important;margin:20px auto 0!important;background:#d71920!important;color:#fff!important;border:0!important;border-radius:999px!important;padding:11px 18px!important;font:800 13px Arial,sans-serif!important;box-shadow:0 12px 30px rgba(0,0,0,.3)!important;cursor:pointer!important";
  btn.addEventListener("click",()=>openManager(`${section.url}?create=1`));
  wrap.appendChild(btn);
  grid.parentNode.insertBefore(wrap,grid.nextSibling);
});
      const pageActions=pageManagers[form.path];
      if(pageActions&&pageActions.length){
        let bar=doc.querySelector("[data-cms-page-actions]");
        if(!bar){
          bar=doc.createElement("div");
          bar.dataset.cmsPageActions="true";
          bar.dataset.cmsUi="true";
          bar.style.cssText="position:fixed!important;left:50%!important;bottom:16px!important;transform:translateX(-50%)!important;z-index:999996!important;display:flex!important;align-items:center!important;justify-content:center!important;flex-wrap:wrap!important;gap:8px!important;max-width:calc(100vw - 32px)!important;background:#062e3b!important;padding:9px 14px!important;border-radius:999px!important;box-shadow:0 18px 40px rgba(0,0,0,.45)!important";
          const label=doc.createElement("span");
          label.style.cssText="color:#fff!important;font:800 11px Arial!important;margin-right:2px!important;white-space:nowrap!important";
          label.textContent="Manage this page:";
          bar.appendChild(label);
          pageActions.forEach(([name,url])=>{
            const btn=doc.createElement("button");
            btn.type="button";
            btn.textContent=name;
            btn.title=`Open ${name} in the admin panel`;
            btn.style.cssText="all:unset!important;box-sizing:border-box!important;cursor:pointer!important;color:#fff!important;background:#d71920!important;padding:8px 13px!important;border-radius:999px!important;font:700 11px Arial!important;white-space:nowrap!important";
            btn.addEventListener("click",()=>openManager(url));
            bar.appendChild(btn);
          });
          doc.body.appendChild(bar);
        }
      }
      doc.querySelectorAll("main section").forEach(section=>{section.dataset.visualSection="true";section.draggable=false});
      doc.querySelectorAll("main img").forEach(img=>{
        if(img.dataset.visualImage==="true")return;
        img.dataset.visualImage="true";
        img.title="Double-click to change this image";
        img.addEventListener("dblclick",event=>{event.preventDefault();event.stopPropagation();const next=window.prompt("Image URL",img.getAttribute("src")||"");if(next){img.src=next;persistContainer(img.closest("[data-cms-card]")||img.parentElement);importCurrentPage(true)}});
      });
    };
    decorate();
    if(!frame._cmsObserver){let scheduled=false;frame._cmsObserver=new MutationObserver(mutations=>{if(mutations.every(mutation=>(mutation.target.nodeType===1?mutation.target:mutation.target.parentElement)?.closest?.("[data-cms-editable=true]")))return;if(scheduled)return;scheduled=true;(frame.contentWindow?.requestAnimationFrame||requestAnimationFrame)(()=>{scheduled=false;decorate()})});frame._cmsObserver.observe(doc.querySelector("main")||doc.body,{childList:true,subtree:true})}
    setActualEditing(true);
  };
  return <div className="fixed inset-0 z-[90] bg-slate-200 flex flex-col">
    <header className="h-16 bg-[#062e3b] text-white flex items-center px-3 lg:px-5 gap-3 shadow-xl shrink-0"><button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs font-bold hover:bg-white/10"><ArrowLeft size={18}/><span className="hidden sm:inline">Back to Admin Panel</span></button><div className="min-w-0"><strong className="block text-sm truncate">{form.name}</strong><span className="block text-[10px] text-white/55 truncate">{form.path} · {form.status}</span></div><div className="hidden md:flex bg-black/20 p-1 rounded-lg ml-auto"><Device active={device==="desktop"} onClick={()=>setDevice("desktop")} icon={Monitor}/><Device active={device==="tablet"} onClick={()=>setDevice("tablet")} icon={Tablet}/><Device active={device==="mobile"} onClick={()=>setDevice("mobile")} icon={Smartphone}/></div><div className="flex items-center rounded-lg border border-white/20 bg-black/15 p-1"><button type="button" onClick={openActualWebsite} className={`inline-flex gap-2 items-center rounded-md px-3 py-2 text-xs font-bold ${mode==="actual"?"bg-white text-slate-900 shadow":"text-white/70 hover:text-white"}`}><Eye size={16}/>Actual website</button><button type="button" onClick={openComponentCanvas} className={`rounded-md px-3 py-2 text-xs font-bold ${mode==="edit"?"bg-white text-slate-900 shadow":"text-white/70 hover:text-white"}`}>Component canvas</button></div><button disabled={saving} onClick={()=>save("draft")} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold">Save draft</button>{canPublish&&<button disabled={saving} onClick={()=>save("published")} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold"><Save size={15}/>Publish</button>}</header>
    <div className="flex-1 overflow-auto p-3 lg:p-6 relative"><button type="button" onClick={()=>openManager()} className="fixed z-[95] right-8 top-20 inline-flex items-center gap-2 rounded-xl bg-[#062e3b] px-4 py-3 text-xs font-extrabold text-white shadow-xl hover:bg-red-600"><Database size={17}/>Manage page data</button><div style={{width}} className="mx-auto min-h-full bg-white shadow-2xl transition-[width] duration-300 overflow-hidden">
      {mode==="actual"||mode==="edit"?<div className="relative h-[calc(100vh-7rem)]"><iframe ref={currentFrameRef} src={actualPageUrl} onLoad={()=>{const frame=currentFrameRef.current;frame?._cmsObserver?.disconnect();if(frame)frame._cmsObserver=null;setActualEditing(false);if(mode==="edit")setTimeout(enableActualEditing,150);scheduleCanvasRefresh()}} title="Actual public website visual editor" className="w-full h-full"/><div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white border shadow-xl rounded-xl p-3 flex items-center gap-3"><span className="text-xs font-bold text-slate-700">{mode==="edit"?(actualEditing?"Click any outlined text to edit it. Double-click outlined images to replace them.":"Preparing editable components on the real page..."):"Current public-page design with its real header, styling and images"}</span>{mode==="edit"&&<button onClick={enableActualEditing} className="rounded-lg bg-red-600 text-white px-3 py-2 text-xs font-bold">{actualEditing?"Editing enabled":"Enable editing"}</button>}{mode==="actual"&&<button onClick={openComponentCanvas} className="rounded-lg bg-slate-900 text-white px-3 py-2 text-xs font-bold">Edit this page</button>}</div></div>:<div className="visual-canvas">
        <section className="managed-hero group/hero relative min-h-[500px]">
          {form.hero.image&&<img src={form.hero.image} alt=""/>}<div className="managed-hero-shade"/><div className="container managed-hero-content"><Editable value={form.hero.eyebrow} onChange={v=>hero("eyebrow",v)} as="p" className="managed-eyebrow"/><Editable value={form.hero.title} onChange={v=>hero("title",v)} as="h1"/><Editable value={form.hero.subtitle} onChange={v=>hero("subtitle",v)} as="p"/><Editable value={form.hero.buttonText} onChange={v=>hero("buttonText",v)} as="span" className="managed-button" placeholder="Add button text"/></div><label className="absolute top-4 right-4 opacity-0 group-hover/hero:opacity-100 transition bg-white text-slate-900 shadow-lg rounded-lg px-3 py-2 text-xs font-bold cursor-pointer inline-flex items-center gap-2"><Image size={15}/>Change hero<input type="file" className="hidden" accept="image/*" onChange={e=>upload(e.target.files?.[0],"hero")}/></label>
        </section>
        {form.sections.map((section,index)=><div key={section.id} draggable onDragStart={()=>setDragging(index)} onDragOver={e=>e.preventDefault()} onDrop={()=>drop(index)} className="relative group/block border-y-2 border-transparent hover:border-red-500 transition-colors"><Toolbar index={index} total={form.sections.length} type={section.type} onType={v=>change(index,"type",v)} onMove={d=>move(index,index+d)} onDuplicate={()=>duplicate(index)} onDelete={()=>remove(index)}/><InlineSection section={section} index={index} change={change} upload={upload}/></div>)}
        <div className="relative py-12 flex justify-center bg-slate-50 border-t border-dashed"><button onClick={()=>setShowBlocks(v=>!v)} className="inline-flex items-center gap-2 rounded-full bg-red-600 text-white px-5 py-3 font-extrabold shadow-lg"><Plus size={18}/>Add component</button>{showBlocks&&<div className="absolute bottom-24 z-20 w-[min(680px,90%)] bg-white border rounded-2xl shadow-2xl p-4"><div className="flex items-center justify-between mb-3"><strong>Choose a component</strong><button onClick={()=>setShowBlocks(false)}>×</button></div><div className="grid sm:grid-cols-2 gap-2">{blockTypes.map(([type,title,text])=><button key={type} onClick={()=>add(type)} className="text-left border rounded-xl p-3 hover:border-red-400 hover:bg-red-50"><strong className="block text-sm">{title}</strong><span className="text-xs text-slate-500">{text}</span></button>)}</div></div>}</div>
      </div>}
    </div></div>
    {cardEditor&&<div className="fixed inset-0 z-[125] grid place-items-center bg-slate-950/65 p-4"><div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b px-6 py-4"><div><h2 className="text-lg font-extrabold text-slate-900">{cardKind==="Management team"?"Edit team member":"Edit card details"}</h2><p className="text-xs text-slate-500">{cardKind==="Management team"?"Update this Management Team profile":"Update this Services and Resources card"}</p></div><button type="button" onClick={()=>{setCardEditor(null);setCardKind("")}} className="rounded-lg p-2 hover:bg-slate-100"><X size={20}/></button></div><div className="grid gap-4 p-6 md:grid-cols-2"><label className="md:col-span-2"><span className="mb-1.5 block text-xs font-bold uppercase text-slate-500">{cardKind==="Management team"?"Full name":"Card title"}</span><input value={cardEditor.title} onChange={event=>setCardEditor(value=>({...value,title:event.target.value}))} className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-red-500"/></label><label className="md:col-span-2"><span className="mb-1.5 block text-xs font-bold uppercase text-slate-500">{cardKind==="Management team"?"Biography":"Description"}</span><textarea rows={cardKind==="Management team"?5:4} value={cardEditor.description} onChange={event=>setCardEditor(value=>({...value,description:event.target.value}))} className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-red-500"/></label>{cardKind==="Management team"?null:<><label><span className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Destination link</span><input value={cardEditor.link} onChange={event=>setCardEditor(value=>({...value,link:event.target.value}))} placeholder="/services/example" className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-red-500"/></label><label><span className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Action label</span><input value={cardEditor.actionText} onChange={event=>setCardEditor(value=>({...value,actionText:event.target.value}))} placeholder="Access service" className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-red-500"/></label></>}<label className="md:col-span-2"><span className="mb-1.5 block text-xs font-bold uppercase text-slate-500">{cardKind==="Management team"?"Photo URL":"Image URL"}</span><input value={cardEditor.image} onChange={event=>setCardEditor(value=>({...value,image:event.target.value}))} placeholder={cardKind==="Management team"?"/images/team/photo.jpg":"/images/example.jpg"} className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-red-500"/></label></div><div className="flex justify-end gap-3 border-t bg-slate-50 px-6 py-4"><button type="button" onClick={()=>{setCardEditor(null);setCardKind("")}} className="rounded-lg border bg-white px-4 py-2.5 text-sm font-bold">Cancel</button><button type="button" onClick={saveCardDetails} className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-extrabold text-white">{cardKind==="Management team"?"Save changes":"Save card details"}</button></div></div></div>}
    {managerOpen&&<div className="fixed inset-0 z-[110] bg-slate-950/65 p-3 lg:p-8"><div className="ml-auto flex h-full w-full max-w-[1450px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"><div className="flex min-h-16 items-center gap-2 border-b bg-slate-50 px-4"><div className="mr-3"><strong className="block text-sm text-slate-900">Page Content Manager</strong><span className="text-[11px] text-slate-500">CRUD tools for {form.name}</span></div><div className="flex flex-1 flex-wrap gap-2"><button type="button" onClick={()=>{setManagerUrl("canvas");refreshCanvasCards()}} className={`rounded-lg px-3 py-2 text-xs font-bold ${managerUrl==="canvas"?"bg-red-600 text-white":"border bg-white text-slate-700"}`}>Canvas cards ({canvasCards.length})</button>{managers.map(([label,url])=><button type="button" key={url} onClick={()=>setManagerUrl(url)} className={`rounded-lg px-3 py-2 text-xs font-bold ${managerUrl===url?"bg-red-600 text-white":"border bg-white text-slate-700"}`}>{label}</button>)}</div><button type="button" onClick={()=>{const wasAdmin=managerUrl!=="canvas";setManagerOpen(false);if(wasAdmin)reloadCanvasFrame()}} className="rounded-lg p-2 text-slate-600 hover:bg-slate-200"><X size={20}/></button></div>{managerUrl==="canvas"?<div className="min-h-0 flex-1 overflow-y-auto bg-slate-100 p-6"><div className="mx-auto max-w-5xl"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-extrabold text-slate-900">Visual canvas cards</h2><p className="mt-1 text-sm text-slate-500">Cards added on the canvas appear here. Edit their content directly on the canvas and drag the Drag handle to reorder them.</p></div><button type="button" onClick={refreshCanvasCards} className="rounded-lg border bg-white px-3 py-2 text-xs font-bold">Refresh</button></div><div className="grid gap-3 md:grid-cols-2">{canvasCards.map(card=><article key={`${card.index}-${card.title}`} className="rounded-xl border bg-white p-4 shadow-sm"><div className="flex items-start gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-900 text-xs font-bold text-white">{card.index+1}</span><div className="min-w-0 flex-1"><h3 className="font-extrabold text-slate-900">{card.title}</h3><p className="mt-1 line-clamp-2 text-xs text-slate-500">{card.description||"No description"}</p></div></div><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={()=>canvasCardAction(card.index,"Duplicate")} className="rounded-lg border px-3 py-2 text-xs font-bold">Duplicate</button><button type="button" onClick={()=>canvasCardAction(card.index,"Delete")} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700">Delete</button></div></article>)}{canvasCards.length===0&&<div className="col-span-full rounded-xl border-2 border-dashed bg-white p-10 text-center text-sm text-slate-500">Enable Component Canvas editing to detect this page's cards.</div>}</div></div></div>:<iframe key={managerUrl} src={managerUrl} title="Page content manager" className="min-h-0 flex-1 bg-slate-100"/>}</div></div>}
  </div>;
}
const Device=({active,onClick,icon:Icon})=><button onClick={onClick} className={`p-2 rounded-md ${active?"bg-white text-slate-900":"text-white/60"}`}><Icon size={16}/></button>;
const Toolbar=({index,total,type,onType,onMove,onDuplicate,onDelete})=><div className="absolute z-20 top-3 right-3 opacity-0 group-hover/block:opacity-100 transition flex items-center bg-[#062e3b] text-white rounded-lg shadow-xl p-1"><span className="p-2 cursor-grab"><GripVertical size={15}/></span><select value={type} onChange={e=>onType(e.target.value)} className="bg-transparent text-[11px] font-bold outline-none">{blockTypes.map(x=><option className="text-slate-900" value={x[0]} key={x[0]}>{x[1]}</option>)}</select><button disabled={index===0} onClick={()=>onMove(-1)} className="p-2 disabled:opacity-30"><ChevronUp size={15}/></button><button disabled={index===total-1} onClick={()=>onMove(1)} className="p-2 disabled:opacity-30"><ChevronDown size={15}/></button><button onClick={onDuplicate} className="p-2"><Copy size={15}/></button><button onClick={onDelete} className="p-2 text-red-300"><Trash2 size={15}/></button></div>;
function InlineSection({section,index,change,upload}){const copy=<div className="managed-copy"><Editable value={section.eyebrow} onChange={v=>change(index,"eyebrow",v)} as="p" className="managed-eyebrow dark"/><Editable value={section.title} onChange={v=>change(index,"title",v)} as="h2"/><Editable value={section.body} onChange={v=>change(index,"body",v)} as="p"/><Editable value={section.buttonText} onChange={v=>change(index,"buttonText",v)} as="span" className="managed-button" placeholder="Add button"/></div>;if(section.type==="split")return <section className="managed-section managed-split"><div className="container managed-split-inner"><ImageEdit value={section.image} onFile={f=>upload(f,"section",index)}/>{copy}</div></section>;if(section.type==="cards"||section.type==="stats")return <section className={`managed-section ${section.type==="cards"?"managed-muted":"managed-stats"}`}><div className="container">{copy}<div className={section.type==="cards"?"managed-card-grid":"managed-stat-grid"}>{(section.items||[]).map((item,i)=><article key={i}><div><Editable value={item.title} onChange={v=>change(index,"items",section.items.map((x,n)=>n===i?{...x,title:v}:x))} as={section.type==="cards"?"h3":"strong"}/><Editable value={item.text} onChange={v=>change(index,"items",section.items.map((x,n)=>n===i?{...x,text:v}:x))} as={section.type==="cards"?"p":"span"}/></div></article>)}</div><button onClick={()=>change(index,"items",[...(section.items||[]),{title:"New item",text:"Description",image:""}])} className="mt-5 border border-dashed rounded-lg px-4 py-2 text-xs font-bold">+ Add item</button></div></section>;return <section className={`managed-section ${section.type==="cta"?"managed-cta":""}`}><div className="container">{copy}</div></section>}
const ImageEdit=({value,onFile})=><label className="relative min-h-64 bg-slate-100 rounded-xl overflow-hidden cursor-pointer group/image">{value?<img src={value} alt="" className="w-full h-full object-cover"/>:<span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-400">Add image</span>}<span className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 flex items-center justify-center text-white font-bold">Change image</span><input type="file" accept="image/*" className="hidden" onChange={e=>onFile(e.target.files?.[0])}/></label>;
