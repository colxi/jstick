/*
 * Import the main Jstick container and essential initialization
 */
import {Jstick} from './engine/engine-core.js';


/* 
 * Inject Jstick.Viewport in the DOM
 */
import './engine/engine-styles.js';


/* 
 * Import the Jstick Engine components 
 */

import './engine/engine-render.js';
// declare Jstick.Viewport
import './engine/engine-viewport.js';
// declare Jstick.Image
import './engine/engine-image.js';
// declare Jstick.Input
import './engine/engine-input.js';
// declare Jstick.Sprite
import './engine/engine-sprite.js';
// declare Jstick.Cache
import './engine/engine-cache.js';
// declare Jstick.Loop
import './engine/engine-loop.js';


/*
 * Done ! ready to export...
 */
 export {Jstick};