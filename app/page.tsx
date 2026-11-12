import type {Metadata} from 'next';
import {cookies} from 'next/headers';
import Portfolio from '@/components/Portfolio';
import {getData,publicData} from '@/lib/database';
export const dynamic='force-dynamic';
export async function generateMetadata():Promise<Metadata>{
 const data=await getData();const lang=(await cookies()).get('signal_lang')?.value||data.settings.defaultLanguage;const fr=lang==='fr';const base=process.env.SITE_URL?new URL(process.env.SITE_URL):undefined;
 const title=fr?'ΠΡΙΜΕ — Équipe CTF de Lomé':'ΠΡΙΜΕ — CTF Team from Lomé';
 const description=fr?data.texts.intro.fr:'ΠΡΙΜΕ is a CTF team from Lomé, Togo, exploring web security, cryptography, forensics, reverse engineering, OSINT and binary exploitation.';
 return {metadataBase:base,title,description,alternates:base?{canonical:'/'}:undefined,openGraph:{title,description,type:'website',locale:fr?'fr_FR':'en_US',alternateLocale:fr?'en_US':'fr_FR',images:[{url:'/og.png',width:1200,height:630,alt:'ΠΡΙΜΕ — Lomé, Togo'}]},twitter:{card:'summary_large_image',title,description,images:['/og.png']},icons:{icon:'/icon.svg'}};
}
export default async function Page(){const data=await getData();const l=(await cookies()).get('signal_lang')?.value;return <Portfolio initialData={publicData(data)} initialLang={l==='en'||l==='fr'?l:data.settings.defaultLanguage}/>}
