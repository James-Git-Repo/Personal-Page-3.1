import { sb } from "./sb-init.js";
const q = s => document.querySelector(s);
function inject(bio){
  if (!bio) return;
  if (q(".bio-name")) q(".bio-name").textContent = bio.title || "";
  if (q("#bioBody")) q("#bioBody").innerHTML = bio.body_html || "";
  if (q(".bio-hero") && bio.hero_url){ const el = q(".bio-hero"); el.style.backgroundImage = `url('${bio.hero_url}')`; el.style.backgroundSize='cover'; }
}
async function fetchBio(){
  const { data, error } = await sb.from("bio_pages").select("*").eq("slug","bio").eq("status","published").maybeSingle();
  if (error) { console.error(error); return null; }
  return data;
}
document.addEventListener("DOMContentLoaded", async ()=>{ inject(await fetchBio()); });
