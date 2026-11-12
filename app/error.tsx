'use client';
import {usePrimeStore} from '@/store/usePrimeStore';
export default function ErrorPage({reset}:{reset:()=>void}){const lang=usePrimeStore(s=>s.lang);return <main className="section"><h1>ΠΡΙΜΕ</h1><p>{lang==='fr'?'Le signal est temporairement interrompu.':'The signal is temporarily interrupted.'}</p><button onClick={reset}>{lang==='fr'?'Réessayer':'Retry'}</button></main>}
