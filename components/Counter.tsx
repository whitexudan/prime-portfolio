'use client';
import {useEffect,useRef,useState} from 'react';
export function Counter({value,suffix,lang}:{value:number;suffix:string;lang:string}){
 const ref=useRef<HTMLSpanElement>(null);const [number,setNumber]=useState(value);
 useEffect(()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;let frame=0;const obs=new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)return;obs.disconnect();const start=performance.now();function tick(now:number){const p=Math.min(1,(now-start)/1100);setNumber(Math.round(value*(1-(1-p)**3)));if(p<1)frame=requestAnimationFrame(tick)}frame=requestAnimationFrame(tick)},{threshold:.3});if(ref.current)obs.observe(ref.current);return()=>{obs.disconnect();cancelAnimationFrame(frame)}},[value]);
 return <span ref={ref}>{new Intl.NumberFormat(lang).format(number)}<sup>{suffix}</sup></span>
}
