'use client';
import dynamic from 'next/dynamic';
import {Component,useEffect,useState,type ReactNode} from 'react';
const Scene=dynamic(()=>import('./3d/PrimeWorld'),{ssr:false,loading:()=>null});
class Boundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true}}render(){return this.state.failed?null:this.props.children}}
export function World({accent,bg,enabled}:{accent:string;bg:string;enabled:boolean}){
 const [run,setRun]=useState(false);const [visible,setVisible]=useState(true);
 useEffect(()=>{const el=document.querySelector('.world');if(!el)return;const obs=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting));obs.observe(el);const media=matchMedia('(prefers-reduced-motion: reduce)');function check(){const canvas=document.createElement('canvas');let supported=false;try{supported=!!canvas.getContext('webgl2')}catch{}setRun(enabled&&innerWidth>850&&!media.matches&&supported)}const timer=setTimeout(check,500);media.addEventListener('change',check);window.addEventListener('resize',check);return()=>{clearTimeout(timer);obs.disconnect();media.removeEventListener('change',check);window.removeEventListener('resize',check)}},[enabled]);
 return <div className="world" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit-core">Π</div>{run&&visible&&<Boundary><Scene accent={accent} bg={bg}/></Boundary>}<span className="world-label">SIGNAL NODE / LOMÉ<br/>06°08′ N · 01°13′ E</span></div>
}
