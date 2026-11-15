import {expect,it} from 'vitest';
import {parseSession} from './storage';
it('refuse les données corrompues et restaure une grille valide',()=>{expect(parseSession('{')).toBeNull();expect(parseSession(JSON.stringify({version:1,size:3,board:[0],moves:0,seconds:0}))).toBeNull();expect(parseSession(JSON.stringify({version:1,size:3,board:[1,2,3,4,5,6,7,0,8],moves:1,seconds:12,history:[]}))?.seconds).toBe(12);expect(parseSession(JSON.stringify({version:1,size:3,board:[2,1,3,4,5,6,7,8,0],moves:0,seconds:0}))).toBeNull()});
