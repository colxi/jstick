// Import & Inject engine styles in the DOM 
import './css/engine-styles.js';

// import the jstick Constructor prototype parts
import {Viewport} from './prototype/viewport.js';
import {Input} from './prototype/input.js';
import {Camera}  from './prototype/camera.js';
import {Scene} from './prototype/scene.js';
import {Renderer} from './prototype/renderer.js';
import {Loop} from './prototype/loop.js';

// Import the components
import {Texture} from './components/Texture.js';
import {State} from './components/State.js';
import {Sprite} from './components/Sprite.js';
import {Animation} from './components/Animation.js';
import {Actor} from './components/Actor.js';


/****************************************************************
 * 
 * CONSTRUCTOR
 * 
 /***************************************************************/
const Jstick  = function(containerID){

    if( !new.target ) return new Jstick( containerID );
    
    let container = document.querySelector(containerID);
    if(!containerID) throw new Error('Container element not found('+containerID+')');

    this.status       = true;

    this.Viewport     = new Viewport( this , container );
    this.Scene        = new Scene( this, container.offsetWidth, container.offsetHeight );
    this.Camera       = new Camera( this );
    this.Renderer     = new Renderer( this );
    this.Input        = new Input( this );
    this.Loop         = new Loop( this );

    
    this.Scene.addLayer( 'default' , 0 );
    this.Viewport.updateSize();


    return this;
}



// EXPORT the Constructor
export {Jstick};
// EXPORT the Components
export {Texture};
export {State};
export {Sprite};
export {Animation};
export {Actor};
