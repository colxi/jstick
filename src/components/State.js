import {Jstick} from '../jstick.js';


/**
 * 
 * State Constructor : 
 * 
 */
const State = function( name, animation, controller ){
    // handle requests performed without using the keyword 'new'
    // otherwhise the Constructor will fail for the lack of own context (this)
    if( !this ) return new State( name, animation, controller );

    // validate the name
    if( typeof name !== 'string' || !name.trim().length ) throw new Error('First argument ("name") must be a non empty string');
    
    
    // Thhe controller must be a function
    if( typeof controller !== 'function' ) throw new Error('Third argument ("controller") must be a function');
    
    if( typeof animation !== 'object') throw new Error('Second argument ("animation") must be an Animation or a Sprite object reference');
    // If is not an animation or a sprite throw error
    if( animation.__type__ !== 'Animation'){
        // if is a Sprite object reference , generate a new animation of a single frame
        if( animation.__type__ === 'Sprite'){
            animation = new Animation(  { 0 : animation }, 1, true )
        }else throw new Error('First argument ("animation") must be an Animation or a Sprite object reference');
    }

    this.__type__   = 'State'; 
    this.name       = name; 
    this.animation  = animation; 
    this.controller = controller;
}

export {State};