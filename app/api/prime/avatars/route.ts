import {NextResponse} from 'next/server';
import {randomUUID} from 'node:crypto';
import {authorized} from '@/lib/auth';
import {AVATAR_BUCKET,supabaseAdmin} from '@/lib/supabase-admin';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const MAX_BYTES=3*1024*1024;
const noStore={'Cache-Control':'no-store'};
function imageFormat(bytes:Buffer):{ext:'jpg'|'png'|'webp';mime:string}|null{
 if(bytes.length>=8&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return {ext:'png',mime:'image/png'};
 if(bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return {ext:'jpg',mime:'image/jpeg'};
 if(bytes.length>=12&&bytes.subarray(0,4).toString('ascii')==='RIFF'&&bytes.subarray(8,12).toString('ascii')==='WEBP')return {ext:'webp',mime:'image/webp'};
 return null;
}
export async function POST(request:Request){
 try{
  if(!await authorized(request))return NextResponse.json({error:'UNAUTHORIZED'},{status:403,headers:noStore});
  const declared=Number(request.headers.get('content-length')||0);
  if(Number.isFinite(declared)&&declared>MAX_BYTES+64*1024)return NextResponse.json({error:'TOO_LARGE'},{status:413,headers:noStore});
  const form=await request.formData();const file=form.get('file');
  if(typeof File==='undefined'||!(file instanceof File)||file.size===0)return NextResponse.json({error:'INVALID_FILE'},{status:400,headers:noStore});
  if(file.size>MAX_BYTES)return NextResponse.json({error:'TOO_LARGE'},{status:413,headers:noStore});
  const bytes=Buffer.from(await file.arrayBuffer());const format=imageFormat(bytes);
  if(!format||(file.type&&file.type!==format.mime))return NextResponse.json({error:'UNSUPPORTED_IMAGE'},{status:415,headers:noStore});
  const filename=`${randomUUID()}.${format.ext}`;
  const {error}=await supabaseAdmin().storage.from(AVATAR_BUCKET).upload(filename,bytes,{contentType:format.mime,upsert:false});
  if(error)return NextResponse.json({error:'STORAGE'},{status:503,headers:noStore});
  return NextResponse.json({url:`/api/prime/avatars/${filename}`,mime:format.mime,size:bytes.length},{status:201,headers:noStore});
 }catch{return NextResponse.json({error:'UPLOAD_FAILED'},{status:503,headers:noStore})}
}
