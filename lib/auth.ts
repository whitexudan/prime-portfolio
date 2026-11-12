import {cookies} from 'next/headers';
import {randomBytes} from 'node:crypto';
import {configured,seal,unseal,SESSION_SECONDS} from './crypto';
export const SESSION_COOKIE='signal_admin';
export const secure=process.env.NODE_ENV==='production';
export async function session(){if(!configured())return null;const token=(await cookies()).get(SESSION_COOKIE)?.value;const data=token?unseal(token):null;return data?.role==='admin'&&typeof data.csrf==='string'?data:null}
export function createSession(){return seal({role:'admin',csrf:randomBytes(24).toString('hex'),exp:Date.now()+SESSION_SECONDS*1000})}
export function sameOrigin(request:Request){const origin=request.headers.get('origin');const site=process.env.SITE_URL;return !!site&&!!origin&&origin===new URL(site).origin}
export async function authorized(request:Request){const data=await session();return !!data&&sameOrigin(request)&&request.headers.get('x-csrf-token')===data.csrf}
export const cookieOptions={httpOnly:true,secure,sameSite:'strict' as const,path:'/',maxAge:SESSION_SECONDS};
export async function boundedJson(request:Request,max=1024*1024):Promise<unknown>{
 if(!request.headers.get('content-type')?.startsWith('application/json'))throw new Error('CONTENT_TYPE');
 const reader=request.body?.getReader();if(!reader)throw new Error('EMPTY');let bytes=0;const chunks:Uint8Array[]=[];
 while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>max){await reader.cancel();throw new Error('BODY_TOO_LARGE')}chunks.push(value)}
 return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
