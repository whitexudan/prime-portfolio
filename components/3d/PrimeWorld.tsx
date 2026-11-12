'use client';
import {Canvas,useFrame} from '@react-three/fiber';
import {Float} from '@react-three/drei/core/Float';
import {useRef} from 'react';
import type {Group} from 'three';
function Signal({accent,bg}:{accent:string;bg:string}){
 const group=useRef<Group>(null);
 useFrame((_,delta)=>{if(group.current)group.current.rotation.y+=Math.min(delta,.05)*.09});
 return <group ref={group} rotation={[.35,0,-.22]}>
 <Float speed={.7} rotationIntensity={.12} floatIntensity={.35}>
 <mesh><icosahedronGeometry args={[1.45,1]}/><meshStandardMaterial color={bg} roughness={.55} metalness={.45}/></mesh>
 <mesh scale={1.006}><icosahedronGeometry args={[1.45,1]}/><meshBasicMaterial color={accent} wireframe transparent opacity={.42}/></mesh>
 {[0,1,2].map((i)=><group key={i} rotation={[i*.8,i*.5,0]}><mesh><torusGeometry args={[2+i*.16,.012,8,96]}/><meshBasicMaterial color={accent} transparent opacity={.55}/></mesh><mesh position={[2+i*.16,0,0]}><sphereGeometry args={[.065,12,12]}/><meshBasicMaterial color={accent}/></mesh></group>)}
 </Float></group>
}
export default function PrimeWorld({accent,bg}:{accent:string;bg:string}){return <Canvas dpr={[1,1.5]} camera={{position:[0,0,7],fov:40}} gl={{alpha:true,antialias:false,powerPreference:'low-power'}}><ambientLight intensity={1.6}/><directionalLight position={[3,4,5]} intensity={3} color={accent}/><Signal accent={accent} bg={bg}/></Canvas>}
