import {JStick} from './engine/engine-core.js';
import {throttledAnimation } from './lib/fps-throttle/src/fps-throttle.js';

import './engine/engine-viewport.js';
import './engine/engine-image.js';
import './engine/engine-map.js';
import './engine/engine-input.js';
import './engine/engine-sprite.js';
import './engine/engine-cache.js';



JStick.gameLoop = new throttledAnimation( (timestamp)=>{
    if(!JStick.status) return;
    JStick.tick(timestamp);
} , 30 );



export {JStick};