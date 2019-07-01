// Viewport , __registerInterfaceAttribute__, __unregisterInterfaceAttribute__,  sendSignal , 


let setupInterface = function( Viewport, sendSignal, _instance_ ){
    return {
        name    : 'mouse',
        signals : [ 'MOUSECLICK' , 'MOUSELEFT', 'MOUSERIGHT', 'MOUSEWHEELUP', 'MOUSEWHEELDOWN' ],
        // todo: interface controller modifies tthis object, and in each tick, its contents 
        // are made accessible to the user 
        properties : {
            MOUSEX : 0,
            MOUSEY : 0 
        },
        enable(){
            Viewport.addEventListener ( 'click', mouseClick, false);
            Viewport.addEventListener ( 'mousedown', mouseDown, false);
            Viewport.addEventListener ( 'mouseup', mouseUp, false );
            Viewport.addEventListener ( 'mousewheel', mouseWheel, false );
            Viewport.addEventListener ( 'mousemove', mouseMove, false );
            Viewport.addEventListener ( 'contextmenu', contextMenu, false );

            _instance_.Input.__registerInterfaceAttribute__( 'MOUSEX' , 0);
            _instance_.Input.__registerInterfaceAttribute__( 'MOUSEY' , 0);
            return true;
        },
        disable(){
            Viewport.removeEventListener ( 'click', mouseClick ,false);
            Viewport.removeEventListener ( 'mousedown', mouseDown ,false);
            Viewport.removeEventListener ( 'mouseup', mouseUp ,false);
            Viewport.removeEventListener ( 'mousewheel', mouseWheel ,false);
            Viewport.removeEventListener ( 'mousemove', mouseMove, false );
            Viewport.removeEventListener ( 'contextmenu', contextMenu ,false);

            _instance_.Input.__unregisterInterfaceAttribute__( 'MOUSEX' );
            _instance_.Input.__unregisterInterfaceAttribute__( 'MOUSEY' );
            return true;
        },
        update(){
            sendSignal( 'MOUSECLICK' , false );
            sendSignal( 'MOUSEWHEELUP' , false );
            sendSignal( 'MOUSEWHEELDOWN' , false );
        },
    };


    function mouseMove(e){
        let x = e.layerX;
        let y = e.layerY;
        sendSignal( 'MOUSEX' , x , true ); 
        sendSignal( 'MOUSEY' , y , true ); 
    };


    function mouseClick(e){
        e.preventDefault();
        sendSignal( 'MOUSECLICK' , true ); 
    }

    function mouseDown(e){
        e.preventDefault();
        let button = e.button;
        if(button === 0) sendSignal( 'MOUSELEFT' , true ); 
        else if(button === 2)  sendSignal( 'MOUSERIGHT' , true );  
    }

    function mouseUp(e){
        e.preventDefault();
        let button  = e.button;
        if(button === 0) sendSignal( 'MOUSELEFT' , false ); 
        else if(button === 2)  sendSignal( 'MOUSERIGHT' , false );  
    }

    function mouseWheel(e){
        e.preventDefault();
        let direction = e.deltaY > 0 ? 1 : -1;
        if( direction === 1) sendSignal( 'MOUSEWHEELUP' , true );
        else sendSignal( 'MOUSEWHEELDOWN' , true ); 
    };

    function contextMenu(e){
        e.preventDefault();
    };
}

export {setupInterface};