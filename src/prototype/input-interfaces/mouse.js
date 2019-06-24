
let setupInterface = function( _instance_ ){
    return {
        name    : 'mouse',
        signals : [ 'MOUSECLICK' , 'MOUSELEFT', 'MOUSERIGHT', 'MOUSEWHEELUP', 'MOUSEWHEELDOWN' ],
        enable(){
            _instance_.Viewport.container.addEventListener ( 'click', mouseClick, false);
            _instance_.Viewport.container.addEventListener ( 'mousedown', mouseDown, false);
            _instance_.Viewport.container.addEventListener ( 'mouseup', mouseUp, false );
            _instance_.Viewport.container.addEventListener ( 'mousewheel', mouseWheel, false );
            _instance_.Viewport.container.addEventListener ( 'mousemove', mouseMove, false );
            _instance_.Viewport.container.addEventListener ( 'contextmenu', contextMenu, false );

            _instance_.Input.__registerInterfaceAttribute__( 'MOUSEX' , 0);
            _instance_.Input.__registerInterfaceAttribute__( 'MOUSEY' , 0);
            return true;
        },
        disable(){
            _instance_.Viewport.container.removeEventListener ( 'click', mouseClick ,false);
            _instance_.Viewport.container.removeEventListener ( 'mousedown', mouseDown ,false);
            _instance_.Viewport.container.removeEventListener ( 'mouseup', mouseUp ,false);
            _instance_.Viewport.container.removeEventListener ( 'mousewheel', mouseWheel ,false);
            _instance_.Viewport.container.removeEventListener ( 'mousemove', mouseMove, false );
            _instance_.Viewport.container.removeEventListener ( 'contextmenu', contextMenu ,false);

            _instance_.Input.__unregisterInterfaceAttribute__( 'MOUSEX' , 0);
            _instance_.Input.__unregisterInterfaceAttribute__( 'MOUSEY' , 0);
            return true;
        },
        update(){
            _instance_.Input.__interfaceSignal__( 'MOUSECLICK' , false );
            _instance_.Input.__interfaceSignal__( 'MOUSEWHEELUP' , false );
            _instance_.Input.__interfaceSignal__( 'MOUSEWHEELDOWN' , false );
        },
    };


    function mouseMove(e){
        let x = e.layerX;
        let y = e.layerY;
        _instance_.Input.__interfaceSignal__( 'MOUSEX' , x , true ); 
        _instance_.Input.__interfaceSignal__( 'MOUSEY' , y , true ); 
    };


    function mouseClick(e){
        e.preventDefault();
        _instance_.Input.__interfaceSignal__( 'MOUSECLICK' , true ); 
    }

    function mouseDown(e){
        e.preventDefault();
        let button = e.button;
        if(button === 0) _instance_.Input.__interfaceSignal__( 'MOUSELEFT' , true ); 
        else if(button === 2)  _instance_.Input.__interfaceSignal__( 'MOUSERIGHT' , true );  
    }

    function mouseUp(e){
        e.preventDefault();
        let button  = e.button;
        if(button === 0) _instance_.Input.__interfaceSignal__( 'MOUSELEFT' , false ); 
        else if(button === 2)  _instance_.Input.__interfaceSignal__( 'MOUSERIGHT' , false );  
    }

    function mouseWheel(e){
        e.preventDefault();
        let direction = e.deltaY > 0 ? 1 : -1;
        if( direction === 1) _instance_.Input.__interfaceSignal__( 'MOUSEWHEELUP' , true );
        else _instance_.Input.__interfaceSignal__( 'MOUSEWHEELDOWN' , true ); 
    };

    function contextMenu(e){
        e.preventDefault();
    };
}

export {setupInterface};