export type Lang = 'fr' | 'en';
export type Localized = {fr: string; en: string};
export type CertificationLink = {label:string; url:string};
export type Member = {id:string; handle:string; publicId:string; role:Localized; specialty:Localized; categories:string[]; certifications:CertificationLink[]; avatar:string; avatarUrl?:string; active:boolean; order:number; published:boolean; links:{label:string; url:string}[]};
export type Entry = {id:string; kind:'milestone'|'competition'; title:Localized; location:string; date:string|null; platform:string; rank:number|null; totalTeams:number|null; score:string; ratingPoints:string; context:Localized; highlights:string[]; skills:string[]; published:boolean};
export type Writeup = {id:string; title:Localized; challenge:string; ctf:string; category:string; difficulty:string; author:string; date:string|null; excerpt:Localized; tags:string[]; url:string; demo:boolean; published:boolean; content:Localized};
export type Tool = {id:string; name:string; group:Localized; description:Localized; confirmed:boolean; published:boolean};
export type Palette = {id:string; name:string; dark:string; light:string; lightAccent:string; darkAccent:string; secondary:string};
export type Data = {
  version:1;
  texts:{intro:Localized; signature:Localized; identity:Localized; hero:Localized; manifesto:Localized; principles:Localized[]};
  members:Member[]; achievements:Entry[]; writeups:Writeup[]; tools:Tool[];
  stats:{id:string; value:number; suffix:string; label:Localized}[];
  categories:{name:string; value:number}[]; domains:string[];
  socials:{id:string; label:string; url:string; published:boolean}[];
  palettes:Palette[];
  settings:{defaultTheme:'light'|'dark'; defaultPalette:string; defaultLanguage:Lang; enable3d:boolean};
};
