import {Jstick} from '../jstick.js';

   
// initiate variables : canvas ref, offsets, scale...



let HIDE_DEVICE_CURSOR = false;






Jstick.Viewport = {
    /*********************************************************************/
    /*
    /* SIZES AND APPEARENCE PROPERTIES
    /*
    /*********************************************************************/
    width     : null,
    height    : null,
    container : null,


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
            //Math.floor( ( x / Jstick.RenderEngine.activeScene.Camera.zoom ) ) ,
            //Math.floor( ( y / Jstick.RenderEngine.activeScene.Camera.zoom )  )
            Math.floor( ( x / Jstick.RenderEngine.activeScene.Camera.zoom ) + Jstick.RenderEngine.activeScene.Camera.x ) ,
            Math.floor( ( y / Jstick.RenderEngine.activeScene.Camera.zoom ) + Jstick.RenderEngine.activeScene.Camera.y )
        ];
    },
    

 
  

}






