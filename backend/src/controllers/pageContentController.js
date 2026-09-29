const PageContent = require("../models/PageContent");
const { deleteAssets } = require("../utils/assetStorage");

const clean = (body) => ({
  path: String(body.path || "/").trim().replace(/\/$/, "") || "/",
  name: String(body.name || "Untitled page").trim(),
  status: body.status === "published" ? "published" : "draft",
  seoTitle: String(body.seoTitle || "").trim(),
  seoDescription: String(body.seoDescription || "").trim(),
  hero: body.hero && typeof body.hero === "object" ? body.hero : {},
  sections: Array.isArray(body.sections) ? body.sections : [],
  overrides: Array.isArray(body.overrides) ? body.overrides.slice(0, 1000) : [],
});
const assetUrls = (page) => [page?.hero?.image, ...(page?.sections || []).flatMap((section) => [section.image, ...(section.items || []).map((item) => item.image)])].filter(Boolean);

const getPublic = async (req, res, next) => {
  try {
    const path = String(req.query.path || "/").replace(/\/$/, "") || "/";
    const page = await PageContent.findOne({ path, status: "published" }).lean();
    res.json({ success: true, data: page || null });
  } catch (error) { next(error); }
};
const getAll = async (_req, res, next) => {
  try { const data = await PageContent.find().sort("name"); res.json({ success: true, data }); }
  catch (error) { next(error); }
};
const getById = async (req, res, next) => {
  try { const data = await PageContent.findById(req.params.id); if (!data) return res.status(404).json({ success:false,message:"Page not found" }); res.json({success:true,data}); }
  catch(error){next(error);}
};
const create = async (req, res, next) => {
  try { const data=clean(req.body); if(await PageContent.findOne({path:data.path})) return res.status(400).json({success:false,message:"This route already has a managed page"}); const page=await PageContent.create(data); res.status(201).json({success:true,data:page}); }
  catch(error){next(error);}
};
const update = async (req,res,next)=>{
  try { const previous=await PageContent.findById(req.params.id); if(!previous)return res.status(404).json({success:false,message:"Page not found"}); const data=clean(req.body); const collision=await PageContent.findOne({path:data.path}); if(collision&&collision._id.toLowerCase()!==previous._id.toLowerCase())return res.status(400).json({success:false,message:"This route already has a managed page"}); const page=await PageContent.findByIdAndUpdate(req.params.id,data); const current=assetUrls(page); await deleteAssets(assetUrls(previous).filter(url=>!current.includes(url))); res.json({success:true,data:page}); }
  catch(error){next(error);}
};
const remove = async(req,res,next)=>{try{const page=await PageContent.findByIdAndDelete(req.params.id);if(!page)return res.status(404).json({success:false,message:"Page not found"});await deleteAssets(assetUrls(page));res.json({success:true,message:"Managed page deleted"});}catch(error){next(error);}};
module.exports={getPublic,getAll,getById,create,update,remove};
