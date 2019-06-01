/*
 * Import the main JSTICK container and essential initialization
 */
import {JStick} from './engine/engine-core.js';


/* 
 * Inject JSTICK.Viewport in the DOM
 */
import './engine/engine-styles.js';


/* 
 * Import the JStick Engine components 
 */

// declare JSTICK.Viewport
import './engine/engine-viewport.js';
// declare JSTICK.Image
import './engine/engine-image.js';
// declare JSTICK.Map
import './engine/engine-map.js';
// declare JSTICK.Input
import './engine/engine-input.js';
// declare JSTICK.Sprite
import './engine/engine-sprite.js';
// declare JSTICK.Cache
import './engine/engine-cache.js';
// declare JSTICK.Loop
import './engine/engine-loop.js';


/*
 * Done ! ready to export...
 */
 export {JStick};