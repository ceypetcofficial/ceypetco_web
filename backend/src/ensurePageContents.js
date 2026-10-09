const PageContent = require("./models/PageContent");

const pages = [
  ["Home","/","/images/hero.png","Powering Sri Lanka with reliable energy for national progress."],
  ["About","/about","/images/about-banner.webp","Our mission, vision and commitment to Sri Lanka."],
  ["History","/history","/images/history-1.jpg","Explore the defining moments behind more than six decades of service."],
  ["Services","/services","/images/distribution.jpg","Applications, public access and customer services."],
  ["Products","/products","/images/lubricants-hero.jpg","Quality energy products for transport, industry and communities."],
  ["Management","/management","/images/management-energy-leadership.webp","Corporate and operational leadership."],
  ["Subsidiaries","/subsidiaries","/images/subsidiaries-petroleum-storage.webp","The institutions supporting Sri Lanka's energy network."],
  ["Related Ministries","/energy-ministries","/images/related-ministries-hero-v2.webp","Related public institutions and national partners."],
  ["Marketing & Sales","/marketing-sales","/images/distribution.jpg","Distribution, fuel products and island-wide customer service."],
  ["Refinery","/refinery","/images/refinery.png","Refining operations and national energy capabilities."],
  ["Aviation","/aviation","/images/aviation-aircraft-refuelling.jpg","Reliable aviation-fuel services across Sri Lanka."],
  ["Agro Chemicals","/agro-chemicals","/images/agro-hero.webp","Responsible crop-protection solutions for farming communities."],
  ["Lubricants","/lubricants","/images/lubricants-hero.jpg","Advanced automotive and industrial oils."],
  ["Marine Bunkering","/services/marine-bunkering","/images/bunkering/marine-bunkering-hero.webp","Safe, reliable marine-fuel services at strategic ports."],
  ["Electric Mobility","/electric-mobility","/images/operations/ev-charging.jpg","Supporting Sri Lanka's transition to cleaner mobility."],
  ["News","/news","/images/news-hero-v2.webp","Stories and corporate updates from CEYPETCO."],
  ["Notices","/notices","/images/notices-hero-v2.webp","Official public information and announcements."],
  ["Tenders","/tenders","/images/tenders-hero.webp","Current procurement opportunities and tender information."],
  ["Projects","/projects","/images/refinery-card-1.jpg","Strategic projects strengthening national energy infrastructure."],
  ["Careers","/careers","/images/career-team.jpg","People, purpose and professional opportunities."],
  ["Annual Reports","/annual-reports","/images/publications-hero-v2.webp","Annual reports, publications and corporate records."],
  ["Gallery","/gallery","/images/aviation-hero.jpg","Photographs and videos from across CEYPETCO."],
  ["Contact","/contact","/images/head-office.webp","Contact CEYPETCO offices and service teams."],
];
module.exports = async function ensurePageContents(){
  for(const [name,path,image,subtitle] of pages){
    const existing=await PageContent.findOne({path});
    const hero={eyebrow:"CEYPETCO",title:name,subtitle,image,imageAlt:`${name} hero image`,buttonText:"",buttonLink:""};
    if(!existing){ await PageContent.create({name,path,status:"draft",seoTitle:name,seoDescription:subtitle,hero,sections:[]}); continue; }
    if(!existing.hero?.image && !(existing.sections||[]).length){ existing.hero=hero; existing.seoTitle=existing.seoTitle||name; existing.seoDescription=existing.seoDescription||subtitle; await existing.save(); }
  }
  console.log(`Page builder ready (${pages.length} managed routes).`);
};
