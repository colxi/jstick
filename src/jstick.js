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
// declare Jstick.Input
import './engine/engine-input.js';
// declare Jstick.Loop
import './engine/engine-loop.js';



/*
 * Done ! ready to export...
 */
 export {Jstick};