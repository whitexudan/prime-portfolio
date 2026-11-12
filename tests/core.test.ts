import {test} from 'node:test';
import assert from 'node:assert/strict';
import {scryptSync,randomBytes} from 'node:crypto';
import {configured,seal,unseal,verifyPassword} from '../lib/crypto.ts';
const salt=randomBytes(16).toString('hex');const password=randomBytes(24).toString('hex');
process.env.SESSION_SECRET=randomBytes(48).toString('hex');
process.env.ADMIN_PASSWORD_HASH=`scrypt$${salt}$${scryptSync(password,salt,64).toString('hex')}`;
test('configuration and password hashes',async()=>{assert.ok(configured());assert.ok(await verifyPassword(password));assert.equal(await verifyPassword('incorrect'),false)});
test('tampered and expired tokens rejected',()=>{const token=seal({role:'admin',exp:Date.now()+10000});assert.equal(unseal(token)?.role,'admin');assert.equal(unseal(token+'tampered'),null);assert.equal(unseal(seal({role:'admin',exp:1})),null);assert.equal(unseal('invalid'),null)});
