const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { getPool } = require("../config/db");

const defaults = {
  AnnualReport:{status:"published"},AviationPrice:{status:"published"},Career:{type:"Full-time",status:"open"},ContactMessage:{status:"new"},Division:{order:0,status:"published"},FuelPrice:{type:"fuel",category:"White Oil",unit:"LKR",status:"active"},FuelStation:{status:"active"},HistoricalPrice:{note:"",status:"active",sourceIndex:0},HistoryPage:{key:"history",milestones:[],gallery:[]},HomeService:{icon:"globe",order:0,status:"published"},ManagementContact:{group:"Corporate Management",order:0,status:"published"},ManagementTeamMember:{order:0,status:"published"},MobileApp:{platform:"android",order:0,featured:false,status:"published"},News:{images:[],category:"general",status:"draft"},Notice:{category:"general",status:"draft"},PageContent:{status:"published",sections:[],overrides:[]},PopupNotice:{description:"",imageUrl:"",status:"inactive",priority:0,showOnce:true,buttonEnabled:false,buttonText:"Learn More",buttonLink:"",linkType:"internal"},Project:{category:"general",documents:[],status:"draft"},RegionalOffice:{status:"active"},Service:{order:0,status:"published"},SupplierResource:{order:0,status:"published"},SupplierSection:{},Tender:{category:"general",documents:[],status:"draft"},TenderDownload:{},User:{role:"admin",status:"active",lastLogin:null,tokenVersion:0}
};
const cmp=v=>v instanceof Date?v.getTime():(typeof v==="string"&&/^\d{4}-\d{2}-\d{2}(T|$)/.test(v)?Date.parse(v):v);
const literalRegex=value=>String(value??"").slice(0,100).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const matchValue=(actual,expected)=>{if(expected&&typeof expected==="object"&&!Array.isArray(expected)&&!(expected instanceof Date)){if("$regex"in expected)return new RegExp(literalRegex(expected.$regex),expected.$options==="i"?"i":"").test(String(actual??""));if("$in"in expected)return expected.$in.includes(actual);if("$nin"in expected)return !expected.$nin.includes(actual);if("$ne"in expected)return actual!==expected.$ne;if("$gte"in expected)return cmp(actual)>=cmp(expected.$gte);if("$gt"in expected)return cmp(actual)>cmp(expected.$gt);if("$lt"in expected)return cmp(actual)<cmp(expected.$lt);if("$lte"in expected)return cmp(actual)<=cmp(expected.$lte);if("$exists"in expected)return expected.$exists?actual!==undefined:actual===undefined;const unknownOp=Object.keys(expected).find(k=>k.startsWith('$'));if(unknownOp)throw new Error(`Unsupported query operator: ${unknownOp}`);}return cmp(actual)===cmp(expected);};
const matches=(doc,filter={})=>Object.entries(filter).every(([key,val])=>key==="$or"?val.some(part=>matches(doc,part)):matchValue(doc[key],val));
const sortSpec=spec=>typeof spec==="string"?{[spec.replace(/^-/,'')]:spec.startsWith("-")?-1:1}:(spec||{});

class Query{
  constructor(run,single=false){this.run=run;this.single=single;this._sort={};this._skip=0;this._limit=null;}
  sort(spec){this._sort={...this._sort,...sortSpec(spec)};return this;} skip(n){this._skip=Number(n)||0;return this;} limit(n){this._limit=Number(n);return this;} select(){return this;} lean(){this._lean=true;return this;}
  async exec(){let rows=await this.run();rows.sort((a,b)=>{for(const [f,d]of Object.entries(this._sort)){const av=cmp(a[f]),bv=cmp(b[f]);if(av<bv)return-d;if(av>bv)return d;}return 0;});rows=rows.slice(this._skip,this._limit==null?undefined:this._skip+this._limit);const out=this.single?(rows[0]||null):rows;if(!this._lean)return out;const plain=x=>x?x.toObject():x;return this.single?plain(out):out.map(plain);}
  then(ok,fail){return this.exec().then(ok,fail);} catch(fail){return this.exec().catch(fail);}
}

module.exports=function defineModel(modelName){
  let Model;
  class Document{
    constructor(data, original = {}) {
      const safe = {};
      for (const [k, v] of Object.entries(data)) {
        if (typeof Document.prototype[k] === 'function') continue; // don't overwrite methods
        if (["constructor", "__proto__", "prototype"].includes(k)) continue;
        safe[k] = v;
      }
      Object.assign(this, safe);
      Object.defineProperty(this, "_original", { value: original, writable: true, enumerable: false });
    }
    isModified(f){return this[f]!==this._original[f];} set(v){Object.assign(this,v);return this;}
    toObject(){const out={};for(const[k,v]of Object.entries(this))out[k]=v;return out;}
    toJSON(){const out=this.toObject();if(modelName==="User")delete out.password;return out;}
    comparePassword(candidate){return bcrypt.compare(candidate,this.password||"");}
    async save(){if(modelName==="User"&&this.password&&this.isModified("password"))this.password=await bcrypt.hash(this.password,12);this.updatedAt=new Date();await persist(this);this._original=this.toObject();return this;}
  }
  const hydrate=row=>{const parsed=JSON.parse(row.Data),data={...parsed,_id:String(row.Id),createdAt:row.CreatedAt,updatedAt:row.UpdatedAt};return new Document(data,{...data});};
  const load=async(includeDeleted=false)=>{const pool=await getPool();const [rows]=await pool.query("SELECT Id,Data,CreatedAt,UpdatedAt FROM WebsiteDocuments WHERE ModelName=?",[modelName]);const docs=rows.map(hydrate);return includeDeleted?docs:docs.filter(doc=>!doc.deletedAt);};
  const persist=async doc=>{const pool=await getPool(),data=doc.toObject();delete data._id;delete data.createdAt;delete data.updatedAt;await pool.query("INSERT INTO WebsiteDocuments (ModelName, Id, Data, CreatedAt, UpdatedAt) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE Data = VALUES(Data), UpdatedAt = VALUES(UpdatedAt)",[modelName,String(doc._id),JSON.stringify(data),new Date(doc.createdAt),new Date(doc.updatedAt)]);};
  const remove=async id=>{const pool=await getPool();await pool.query("DELETE FROM WebsiteDocuments WHERE ModelName=? AND Id=?",[modelName,String(id)]);};
  const apply=(doc,update)=>Object.assign(doc,update.$set||Object.fromEntries(Object.entries(update).filter(([k])=>!k.startsWith("$"))));
  Model=class{
    static find(filter={}){return new Query(async()=>(await load()).filter(d=>matches(d,filter)));} static findOne(filter={}){return new Query(async()=>(await load()).filter(d=>matches(d,filter)),true);} static findById(id){return new Query(async()=>(await load()).filter(d=>d._id.toLowerCase()===String(id).toLowerCase()),true);} static async countDocuments(filter={}){return(await load()).filter(d=>matches(d,filter)).length;}
    static async create(values){const now=new Date(),data={...(defaults[modelName]||{}),...values},doc=new Document({...data,_id:crypto.randomUUID(),createdAt:now,updatedAt:now},{});if((modelName==="News"||modelName==="Notice")&&!doc.slug)doc.slug=`${modelName.toLowerCase()}-${doc._id}`;await doc.save();return doc;}
    static async findByIdAndUpdate(id,update,_opts={}){const doc=await this.findById(id);if(!doc)return null;apply(doc,update);return doc.save();} static async findByIdAndDelete(id){const doc=await this.findById(id);if(!doc)return null;doc.deletedAt=new Date();await doc.save();return doc;}
    static findDeleted(filter={}){return new Query(async()=>(await load(true)).filter(d=>d.deletedAt&&matches(d,filter)));} static async restoreById(id){const docs=await load(true),doc=docs.find(d=>d._id.toLowerCase()===String(id).toLowerCase()&&d.deletedAt);if(!doc)return null;delete doc.deletedAt;doc.updatedAt=new Date();await persist(doc);return doc;} static async hardDeleteById(id){const docs=await load(true),doc=docs.find(d=>d._id.toLowerCase()===String(id).toLowerCase());if(!doc)return null;await remove(doc._id);return doc;}
    static async findOneAndUpdate(filter,update,opts={}){let doc=await this.findOne(filter);if(!doc&&opts.upsert)doc=await this.create({...filter,...(update.$setOnInsert||{})});if(!doc)return null;apply(doc,update);return doc.save();}
    static async updateOne(filter,update,opts={}){const doc=await this.findOne(filter);if(doc){apply(doc,update);await doc.save();return{matchedCount:1};}if(opts.upsert){await this.create({...filter,...(update.$setOnInsert||{}),...(update.$set||{})});return{upsertedCount:1};}return{matchedCount:0};}
    static async bulkWrite(ops){for(const op of ops)if(op.updateOne)await this.updateOne(op.updateOne.filter,op.updateOne.update,{upsert:op.updateOne.upsert});}
  };
  Model.db={collection:name=>defineModel(`_${name}`)};
  Model.modelName=modelName;
  return Model;
};
