export default {
    name    : 'mouse',
    signals : [ 'MOUSELEFT', 'MOUSERIGHT', 'MOUSEWHEELUP', 'MOUSEWHEELDOWN' ],
    enable(){
        JStick.Viewport.Layers.container.addEventListener ( 'mousedown', mouseDown, false);
        JStick.Viewport.Layers.container.addEventListener ( 'mouseup', mouseUp, false );
        JStick.Viewport.Layers.container.addEventListener ( 'mousewheel', mouseWheel, false );
        JStick.Viewport.Layers.container.addEventListener ( 'mousemove', mouseMove, false );
        JStick.Viewport.Layers.container.addEventListener ( 'contextmenu', contextMenu, false );

        JStick.Input.__registerInterfaceAttribute__( 'MOUSEX' , 0);
        JStick.Input.__registerInterfaceAttribute__( 'MOUSEY' , 0);
        return true;
    },
    disable(){
        JStick.Viewport.Layers.container.removeEventListener ( 'mousedown', mouseDown ,false);
        JStick.Viewport.Layers.container.removeEventListener ( 'mouseup', mouseUp ,false);
        JStick.Viewport.Layers.container.removeEventListener ( 'mousewheel', mouseWheel ,false);
        JStick.Viewport.Layers.container.removeEventListener ( 'mousemove', mouseMove, false );
        JStick.Viewport.Layers.container.removeEventListener ( 'contextmenu', contextMenu ,false);

        JStick.Input.__unregisterInterfaceAttribute__( 'MOUSEX' , 0);
        JStick.Input.__unregisterInterfaceAttribute__( 'MOUSEY' , 0);
        return true;
    },
    update(){
        JStick.Input.__interfaceSignal__( 'MOUSEWHEELUP' , false );
        JStick.Input.__interfaceSignal__( 'MOUSEWHEELDOWN' , false );
    },
};


function mouseMove(e){
    let x = e.layerX;
    let y = e.layerY;
    JStick.Input.__interfaceSignal__( 'MOUSEX' , x , true ); 
    JStick.Input.__interfaceSignal__( 'MOUSEY' , y , true ); 
};



function mouseDown(e){
    e.preventDefault();
    let button = e.button;
    if(button === 0) JStick.Input.__interfaceSignal__( 'MOUSELEFT' , true ); 
    else if(button === 2)  JStick.Input.__interfaceSignal__( 'MOUSERIGHT' , true );  
}

function mouseUp(e){
    e.preventDefault();
    let button  = e.button;
    if(button === 0) JStick.Input.__interfaceSignal__( 'MOUSELEFT' , false ); 
    else if(button === 2)  JStick.Input.__interfaceSignal__( 'MOUSERIGHT' , false );  
}

function mouseWheel(e){
    e.preventDefault();
    let direction = e.deltaY > 0 ? 1 : -1;
    if( direction === 1) JStick.Input.__interfaceSignal__( 'MOUSEWHEELUP' , true );
    else JStick.Input.__interfaceSignal__( 'MOUSEWHEELDOWN' , true ); 
};

function contextMenu(e){
    e.preventDefault();
};