import {Jstick} from '../jstick.js';

   
// initiate variables : canvas ref, offsets, scale...



let HIDE_DEVICE_CURSOR = false;






Jstick.Viewport = {
    /*********************************************************************/
    /*
    /* SIZES AND APPEARENCE PROPERTIES
    /*
    /*********************************************************************/
    width     : document.getElementById('container').offsetWidth << 0,
    height    : document.getElementById('container').offsetHeight << 0,
    container :  document.getElementById('container'),


    // Show/hide native device cursor (applies : CSS cursor:none)
    get hideDeviceCursor(){ return HIDE_DEVICE_CURSOR },
    set hideDeviceCursor( value ){
        if (typeof value !== "boolean"){
            throw new Error('Viewport.deviceCursor() : Argument 1 must be a Boolean');
        }

        if( value ) Jstick.Viewport.container.setAttribute('hide-device-cursor',true);
        else Jstick.Viewport.container.removeAttribute('hide-device-cursor');
        HIDE_DEVICE_CURSOR = value;
        return true;
    },


    Layers : {
        // map farest (non interactive & farest layer of map. Usually scenario opaque image. Allows paralax)
        // map behind (non interactive layer of map behind the main map. Allows paralax)
        //map     : document.getElementById('map').getContext('2d'),
        //sprites : document.getElementById('sprites').getContext('2d'),
        // particles (layer for particles and atmosphere)
        // map front (layer of map in front of sprites, allows paralaxing)
        // window UI (game information, lifes, time etc...)
    },

    

  

    /*********************************************************************/
    /*
    /* EVENTS : Custom handlers methods
    /*
    /*********************************************************************/

    onresize      : function(){},
    onloseFPSsync : function(){},




 
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






