/**
 * INTERFACE EXAMPLE
 * The following code illustrates how to implement a mouse controller interface. In this example
 * the mouse has two buttons with a boolean value that represents their state, and the mouse position
 * will be tracked using an interface Attribute.
 * This code structure can be used as a template reference to implement custom interface controllers.
 * 
 */
import {JStick} from '../../jstick.js';

export default {
    // unique name of the controller
    name    : 'mouse',
    
    // declare the unique identifiers fot the signals that will be attached to the input object
    // and provided to the update() function.
    signals : [ 'MOUSELEFT', 'MOUSERIGHT' ],
    
    // <Interface>.enable() : Mandatory method to invoke when enabling the mouse interface. It 
    //                        should declare at least some event listeners to handle the interface
    //                        inputs and activity. 
    enable(){
        // declare the event listeners related to the interface
        JStick.Viewport.Layers.container.addEventListener ( 'mousedown', mouseDown, false);
        JStick.Viewport.Layers.container.addEventListener ( 'mouseup', mouseUp, false );
        JStick.Viewport.Layers.container.addEventListener ( 'mousemove', mouseMove, false );
        // if required register some interface attributes (interface states)
        JStick.Input.__registerInterfaceAttribute__( 'MOUSEX' , 0);
        JStick.Input.__registerInterfaceAttribute__( 'MOUSEY' , 0);
        return true;
    },
    
    // <Interface>.disable() : Mandatory method to invoke when disabling the mouse interface. It
    //                         undoes the actions of <Interface>.enable()
    disable(){
        // remove event listeners
        JStick.Viewport.Layers.container.removeEventListener ( 'mousedown', mouseDown ,false);
        JStick.Viewport.Layers.container.removeEventListener ( 'mouseup', mouseUp ,false);
        JStick.Viewport.Layers.container.removeEventListener ( 'mousemove', mouseMove, false );
        // unregister interface attributes
        JStick.Input.__unregisterInterfaceAttribute__( 'MOUSEX' , 0);
        JStick.Input.__unregisterInterfaceAttribute__( 'MOUSEY' , 0);
        return true;
    },

    //  <Interface>.update() : This method will be called internally by the engine in each loop
    //                         cycle. Some interfaces controllers could need to adjust their states, 
    //                         reset values, or perform tasks, beyond the hardware inputs. In the case
    //                         of a mouse controller, if tracking mouseWheel events, and because no
    //                         event exist to track the ending of the action, this would be the perfect
    //                         spot to deactivate the mousewheel signal.
    update(){
        // perform the necessary actions in the state of the device properties (if needed)
    },
};


// Mouse move Event handler
function mouseMove(e){
    let x = e.layerX;
    let y = e.layerY;
    // propagate the Signal that updates the Attribute mousex and mousey
    JStick.Input.__interfaceSignal__( 'MOUSEX' , x , true ); 
    JStick.Input.__interfaceSignal__( 'MOUSEY' , y , true ); 
};


// mousedown event handler
function mouseDown(e){
    e.preventDefault();
    let button = e.button;
    if(button === 0) JStick.Input.__interfaceSignal__( 'MOUSELEFT' , true ); 
    else if(button === 2)  JStick.Input.__interfaceSignal__( 'MOUSERIGHT' , true );  
}

// mouseup event handler
function mouseUp(e){
    e.preventDefault();
    let button  = e.button;
    if(button === 0) JStick.Input.__interfaceSignal__( 'MOUSELEFT' , false ); 
    else if(button === 2)  JStick.Input.__interfaceSignal__( 'MOUSERIGHT' , false );  
}
