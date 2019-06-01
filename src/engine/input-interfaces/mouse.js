import {Jstick} from '../../jstick.js';

export default {
    name    : 'mouse',
    signals : [ 'MOUSELEFT', 'MOUSERIGHT', 'MOUSEWHEELUP', 'MOUSEWHEELDOWN' ],
    enable(){
        Jstick.Viewport.Layers.container.addEventListener ( 'mousedown', mouseDown, false);
        Jstick.Viewport.Layers.container.addEventListener ( 'mouseup', mouseUp, false );
        Jstick.Viewport.Layers.container.addEventListener ( 'mousewheel', mouseWheel, false );
        Jstick.Viewport.Layers.container.addEventListener ( 'mousemove', mouseMove, false );
        Jstick.Viewport.Layers.container.addEventListener ( 'contextmenu', contextMenu, false );

        Jstick.Input.__registerInterfaceAttribute__( 'MOUSEX' , 0);
        Jstick.Input.__registerInterfaceAttribute__( 'MOUSEY' , 0);
        return true;
    },
    disable(){
        Jstick.Viewport.Layers.container.removeEventListener ( 'mousedown', mouseDown ,false);
        Jstick.Viewport.Layers.container.removeEventListener ( 'mouseup', mouseUp ,false);
        Jstick.Viewport.Layers.container.removeEventListener ( 'mousewheel', mouseWheel ,false);
        Jstick.Viewport.Layers.container.removeEventListener ( 'mousemove', mouseMove, false );
        Jstick.Viewport.Layers.container.removeEventListener ( 'contextmenu', contextMenu ,false);

        Jstick.Input.__unregisterInterfaceAttribute__( 'MOUSEX' , 0);
        Jstick.Input.__unregisterInterfaceAttribute__( 'MOUSEY' , 0);
        return true;
    },
    update(){
        Jstick.Input.__interfaceSignal__( 'MOUSEWHEELUP' , false );
        Jstick.Input.__interfaceSignal__( 'MOUSEWHEELDOWN' , false );
    },
};


function mouseMove(e){
    let x = e.layerX;
    let y = e.layerY;
    Jstick.Input.__interfaceSignal__( 'MOUSEX' , x , true ); 
    Jstick.Input.__interfaceSignal__( 'MOUSEY' , y , true ); 
};



function mouseDown(e){
    e.preventDefault();
    let button = e.button;
    if(button === 0) Jstick.Input.__interfaceSignal__( 'MOUSELEFT' , true ); 
    else if(button === 2)  Jstick.Input.__interfaceSignal__( 'MOUSERIGHT' , true );  
}

function mouseUp(e){
    e.preventDefault();
    let button  = e.button;
    if(button === 0) Jstick.Input.__interfaceSignal__( 'MOUSELEFT' , false ); 
    else if(button === 2)  Jstick.Input.__interfaceSignal__( 'MOUSERIGHT' , false );  
}

function mouseWheel(e){
    e.preventDefault();
    let direction = e.deltaY > 0 ? 1 : -1;
    if( direction === 1) Jstick.Input.__interfaceSignal__( 'MOUSEWHEELUP' , true );
    else Jstick.Input.__interfaceSignal__( 'MOUSEWHEELDOWN' , true ); 
};

function contextMenu(e){
    e.preventDefault();
};