import displayImageUrl from "../utils/displayImageUrl";
import safeUrl from "../utils/safeUrl";

const Paragraphs=({text})=>(text||"").split(/\n\s*\n/).filter(Boolean).map((p,i)=><p key={i}>{p}</p>);
const Button=({section})=>section.buttonText&&section.buttonLink?<a className="managed-button" href={safeUrl(section.buttonLink)}>{section.buttonText}<span>→</span></a>:null;

export function ManagedSections({sections}){
  return (sections||[]).map((section,index)=>{
    const content=<div className="managed-copy">{section.eyebrow&&<p className="managed-eyebrow dark">{section.eyebrow}</p>}<h2>{section.title}</h2><Paragraphs text={section.body}/><Button section={section}/></div>;
    if(section.type==="split")return <section className={`managed-section managed-split ${index%2?"reverse":""}`} key={section.id||index}><div className="container managed-split-inner">{section.image&&<img src={displayImageUrl(section.image)} alt={section.imageAlt||""}/>} {content}</div></section>;
    if(section.type==="cards")return <section className="managed-section managed-muted" key={section.id||index}><div className="container">{content}<div className="managed-card-grid">{(section.items||[]).map((item,i)=><article key={i}>{item.image&&<img src={displayImageUrl(item.image)} alt=""/>}<div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div></div></section>;
    if(section.type==="stats")return <section className="managed-section managed-stats" key={section.id||index}><div className="container">{content}<div className="managed-stat-grid">{(section.items||[]).map((item,i)=><article key={i}><strong>{item.title}</strong><span>{item.text}</span></article>)}</div></div></section>;
    if(section.type==="cta")return <section className="managed-section managed-cta" key={section.id||index}><div className="container">{content}</div></section>;
    return <section className="managed-section" key={section.id||index}><div className="container managed-content">{section.image&&<img src={displayImageUrl(section.image)} alt={section.imageAlt||""}/>} {content}</div></section>;
  });
}

export default function ManagedPage({page}){
  const hero=page.hero||{};
  return <main className="managed-page">
    <section className="managed-hero">
      {hero.image&&<img src={displayImageUrl(hero.image)} alt={hero.imageAlt||""}/>}<div className="managed-hero-shade"/><div className="container managed-hero-content">{hero.eyebrow&&<p className="managed-eyebrow">{hero.eyebrow}</p>}<h1>{hero.title||page.name}</h1>{hero.subtitle&&<p>{hero.subtitle}</p>}<Button section={hero}/></div>
    </section>
    <ManagedSections sections={page.sections}/>
  </main>;
}
