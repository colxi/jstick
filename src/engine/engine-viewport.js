import {Jstick} from '../jstick.js';

   
// initiate variables : canvas ref, offsets, scale...



let HIDE_DEVICE_CURSOR = false;


let IMAGE_SMOOTHING = false;




Jstick.Viewport = {
    /*********************************************************************/
    /*
    /* SIZES AND APPEARENCE PROPERTIES
    /*
    /*********************************************************************/
    width : document.getElementById('container').offsetWidth << 0,
    height : document.getElementById('container').offsetHeight << 0,

    // Show/hide native device cursor (applies : CSS cursor:none)
    get hideDeviceCursor(){ return HIDE_DEVICE_CURSOR },
    set hideDeviceCursor( value ){
        if (typeof value !== "boolean"){
            throw new Error('Viewport.deviceCursor() : Argument 1 must be a Boolean');
        }

        if( value ) Jstick.Viewport.Layers.container.setAttribute('hide-device-cursor',true);
        else Jstick.Viewport.Layers.container.removeAttribute('hide-device-cursor');
        HIDE_DEVICE_CURSOR = value;
        return true;
    },

    // Enable/disable imageSmoothing
    get imageSmoothing(){ return IMAGE_SMOOTHING },
    set imageSmoothing( val ){ 
        if( typeof val !== 'boolean' ) throw new Error('Scroll value must be a boolean');
        IMAGE_SMOOTHING = val ;
        Jstick.Viewport.Layers.map.imageSmoothingEnabled     = IMAGE_SMOOTHING;
        Jstick.Viewport.Layers.sprites.imageSmoothingEnabled = IMAGE_SMOOTHING;
        return true;
    },

    Layers : {
        container :  document.getElementById('container'),
        // map farest (non interactive & farest layer of map. Usually scenario opaque image. Allows paralax)
        // map behind (non interactive layer of map behind the main map. Allows paralax)
        map     : document.getElementById('map').getContext('2d'),
        sprites : document.getElementById('sprites').getContext('2d'),
        // particles (layer for particles and atmosphere)
        // map front (layer of map in front of sprites, allows paralaxing)
        // window UI (game information, lifes, time etc...)
    },

    setView( view ){
        Jstick.Viewport.view = view;
        onResize();
    },
    
    view : undefined,


 

  

    /*********************************************************************/
    /*
    /* EVENTS : Custom handlers methods
    /*
    /*********************************************************************/

    onresize      : function(){},
    onloseFPSsync : function(){},


    /**
     * Viewport.clear() : Clears the Viewport
     */
    clear(){
        let x2 = ( Jstick.Viewport.width / Jstick.Viewport.view.zoom );
        let y2 = ( Jstick.Viewport.height / Jstick.Viewport.view.zoom );

        // Clean map layer
        Jstick.Viewport.Layers.map.clearRect( 0, 0, x2, y2 );
        // clean sprites layer
        Jstick.Viewport.Layers.sprites.clearRect( 0, 0, x2, y2 );
        return true;
    },

 


    /**
     * 
     * Viewport.getAbsoluteCoordinates() : Transform the provided viewport coordinates to map 
     *                                absolute coordinates, considering map scale and map scroll.
     */
    
    getAbsoluteCoordinates( x , y ){
        return [
            Math.floor( ( x / Jstick.view.zoom ) + SCROLL_X ) ,
            Math.floor( ( y / Jstick.view.zoom ) + SCROLL_Y )
        ];
    },
    

 
  

}



function onResize(){
    if( !Jstick.Viewport.view ) return
    Jstick.Viewport.width = document.getElementById('container').offsetWidth;
    Jstick.Viewport.height = document.getElementById('container').offsetHeight;
    
    document.getElementById('map').width = Jstick.Viewport.width;
    document.getElementById('map').height = Jstick.Viewport.height;
    
    document.getElementById('sprites').width = Jstick.Viewport.width;
    document.getElementById('sprites').height = Jstick.Viewport.height;

    Jstick.Viewport.Layers.map.imageSmoothingEnabled     = Jstick.Viewport.imageSmoothing;
    Jstick.Viewport.Layers.sprites.imageSmoothingEnabled = Jstick.Viewport.imageSmoothing;
    
    // apply new scale in a non acumulative way
    Jstick.Viewport.Layers.map.setTransform(1, 0, 0, 1, 0, 0);
    Jstick.Viewport.Layers.map.scale(Jstick.Viewport.view.zoom, Jstick.Viewport.view.zoom);

    // apply new scale in a non acumulative way
    Jstick.Viewport.Layers.sprites.setTransform(1, 0, 0, 1, 0, 0);
    Jstick.Viewport.Layers.sprites.scale(Jstick.Viewport.view.zoom, Jstick.Viewport.view.zoom);
}

window.addEventListener( 'resize' , onResize, false );
onResize();



