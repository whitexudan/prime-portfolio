import {scrypt, randomBytes} from 'node:crypto';
import {promisify} from 'node:util';
import readline from 'node:readline';
// Input is hidden in an interactive terminal and never passed as an argv value.
if(!process.stdin.isTTY){console.error('Run in an interactive terminal.');process.exit(1)}
process.stdout.write('New administrator password (minimum 14 characters): ');
readline.emitKeypressEvents(process.stdin);process.stdin.setRawMode(true);let password='';
process.stdin.on('keypress',async (str,key)=>{
 if(key?.ctrl&&key.name==='c')process.exit(1);
 if(key?.name==='backspace'){password=password.slice(0,-1);return}
 if(key?.name==='return'){
  process.stdin.setRawMode(false);process.stdin.pause();console.log();
  if(password.length<14){console.error('Password too short.');process.exit(1)}
  const salt=randomBytes(16).toString('hex');const hash=await promisify(scrypt)(password,salt,64);console.log('ADMIN_PASSWORD_HASH=scrypt$'+salt+'$'+hash.toString('hex'));process.exit(0);
 }
 if(str&&!key?.ctrl)password+=str;
});
