const PageContent = require("../models/PageContent");
const PageContentRevision = require("../models/PageContentRevision");
const { deleteAssets } = require("../utils/assetStorage");
const { findUnsafeUrl } = require("../utils/securityValidation");
const { sanitizeCmsOverrides } = require("../utils/sanitizeCmsOverrides");

const clean = (body = {}) => ({
  path: String(body.path || "/").trim().slice(0, 200).replace(/\/$/, "") || "/",
  name: String(body.name || "Untitled page").trim().slice(0, 200),
  status: body.status === "published" ? "published" : "draft",
  seoTitle: String(body.seoTitle || "").trim().slice(0, 200),
  seoDescription: String(body.seoDescription || "").trim().slice(0, 500),
  hero: body.hero && typeof body.hero === "object" ? body.hero : {},
  sections: Array.isArray(body.sections) ? body.sections.slice(0, 100) : [],
  overrides: sanitizeCmsOverrides(body.overrides),
});
const validatePage = (data) => {
  if (!/^\/[A-Za-z0-9/_-]*$/.test(data.path) || data.path.includes("//") || data.path.includes("..")) return "Page path must be a safe internal route";
  if (!data.name) return "Page name is required";
  return findUnsafeUrl(data);
};
const assetUrls = (page) => [page?.hero?.image, ...(page?.sections || []).flatMap((section) => [section.image, ...(section.items || []).map((item) => item.image)])].filter(Boolean);
const sanitizePageOutput = (page) => {
  if (!page) return page;
  const value = page?.toObject ? page.toObject() : page;
  return {
    ...value,
    overrides: sanitizeCmsOverrides(value.overrides),
    pendingDraft: value.pendingDraft
      ? { ...value.pendingDraft, overrides: sanitizeCmsOverrides(value.pendingDraft.overrides) }
      : value.pendingDraft,
  };
};

const getPublic = async (req, res, next) => {
  try {
    const path = String(req.query.path || "/").replace(/\/$/, "") || "/";
    const page = await PageContent.findOne({ path, status: "published" }).lean();
    res.json({ success: true, data: sanitizePageOutput(page) || null });
  } catch (error) { next(error); }
};
const editablePage = (page) => {
  const plain = sanitizePageOutput(page);
  return plain?.pendingDraft ? { ...plain, ...plain.pendingDraft, pendingDraft: plain.pendingDraft, hasPendingDraft: true } : plain;
};
const snapshot = async (page, req, action) => {
  if (!page) return;
  const value = page.toObject ? page.toObject() : page;
  await PageContentRevision.create({ pageId: value._id, pageName: value.name, action, snapshot: value, actorId: req.user?._id, actorName: req.user?.name, actorEmail: req.user?.email });
};
const getAll = async (_req, res, next) => {
  try { const data = await PageContent.find().sort("name"); res.json({ success: true, data: data.map(editablePage) }); }
  catch (error) { next(error); }
};
const getById = async (req, res, next) => {
  try { const data = await PageContent.findById(req.params.id); if (!data) return res.status(404).json({ success:false,message:"Page not found" }); res.json({success:true,data:editablePage(data)}); }
  catch(error){next(error);}
};
const create = async (req, res, next) => {
  try { const data=clean(req.body); const invalid=validatePage(data); if(invalid)return res.status(400).json({success:false,message:invalid}); if(req.user.role==="editor"&&data.status==="published")return res.status(403).json({success:false,message:"Editors can save drafts, but an Admin must publish them"}); if(await PageContent.findOne({path:data.path})) return res.status(400).json({success:false,message:"This route already has a managed page"}); const page=await PageContent.create(data); res.status(201).json({success:true,data:page}); }
  catch(error){next(error);}
};
const update = async (req,res,next)=>{
  try { const previous=await PageContent.findById(req.params.id); if(!previous)return res.status(404).json({success:false,message:"Page not found"}); const data=clean(req.body); const invalid=validatePage(data); if(invalid)return res.status(400).json({success:false,message:invalid}); const collision=await PageContent.findOne({path:data.path}); if(collision&&collision._id.toLowerCase()!==previous._id.toLowerCase())return res.status(400).json({success:false,message:"This route already has a managed page"}); if(req.user.role==="editor"){if(data.status==="published")return res.status(403).json({success:false,message:"Editors can save drafts, but an Admin must publish them"});const page=await PageContent.findByIdAndUpdate(req.params.id,{pendingDraft:{...data,status:"draft"},draftedBy:{id:req.user._id,name:req.user.name,email:req.user.email},draftedAt:new Date()});return res.json({success:true,data:editablePage(page),message:"Draft submitted for Admin approval"});} await snapshot(previous,req,data.status==="published"?"publish":"update"); const page=await PageContent.findByIdAndUpdate(req.params.id,{...data,pendingDraft:null,draftedBy:null,draftedAt:null}); res.json({success:true,data:page}); }
  catch(error){next(error);}
};
const remove = async(req,res,next)=>{try{const existing=await PageContent.findById(req.params.id);if(!existing)return res.status(404).json({success:false,message:"Page not found"});await snapshot(existing,req,"delete");const page=await PageContent.findByIdAndDelete(req.params.id);res.json({success:true,message:"Managed page moved to the recycle bin"});}catch(error){next(error);}};
const sanitizeRevision = (revision) => {
  const value = revision?.toObject ? revision.toObject() : revision;
  return value ? { ...value, snapshot: sanitizePageOutput(value.snapshot) } : value;
};
const revisions = async(req,res,next)=>{try{const data=await PageContentRevision.find({pageId:req.params.id}).sort("-createdAt").limit(50);res.json({success:true,data:data.map(sanitizeRevision)});}catch(error){next(error);}};
const allRevisions = async(_req,res,next)=>{try{const data=await PageContentRevision.find().sort("-createdAt").limit(200);res.json({success:true,data:data.map(sanitizeRevision)});}catch(error){next(error);}};
const restoreRevision = async(req,res,next)=>{try{const revision=await PageContentRevision.findById(req.params.revisionId);if(!revision||revision.pageId!==req.params.id)return res.status(404).json({success:false,message:"Revision not found"});const current=await PageContent.findById(req.params.id);if(!current)return res.status(404).json({success:false,message:"Page not found"});await snapshot(current,req,"before_restore");const restored=await PageContent.findByIdAndUpdate(req.params.id,{...clean(revision.snapshot),pendingDraft:null});res.json({success:true,data:restored,message:"Page revision restored"});}catch(error){next(error);}};
module.exports={getPublic,getAll,getById,create,update,remove,revisions,allRevisions,restoreRevision};
