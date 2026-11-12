'use client';
import {create} from 'zustand';
import type {Lang} from '@/types/prime';
type Preferences={lang:Lang;theme:'light'|'dark';palette:string;setLang:(lang:Lang)=>void;setTheme:(theme:'light'|'dark')=>void;setPalette:(palette:string)=>void};
function persist(key:string,value:string){try{localStorage.setItem('signal-'+key,value)}catch{}}
export const usePrimeStore=create<Preferences>(set=>({lang:'fr',theme:'light',palette:'matrix',setLang:lang=>{persist('lang',lang);set({lang});document.cookie=`signal_lang=${lang};path=/;max-age=31536000;SameSite=Lax`},setTheme:theme=>{persist('theme',theme);set({theme})},setPalette:palette=>{persist('palette',palette);set({palette})}}));
