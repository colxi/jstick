import {Jstick} from '../jstick.js';

   
// initiate variables : canvas ref, offsets, scale...



let HIDE_DEVICE_CURSOR = false;


let IMAGE_SMOOTHING = false;




let TARGET_ZOOM = false ; /* {
    x : 0,
    y : 0,
    level : 0
}
*/
let TARGET_SCROLL = false; /*{
    x : 0,
    y : 0
}
*/
let SCROLL_X = 0;
let SCROLL_Y = 0;
// zoom modifier to apply in each step until target zoom is reached
let ZOOM_MODIFIER = 0.05;
let FOLLOWING = undefined;
let SCALE = 1;

Jstick.Camera = {
    follow( actor ){
        FOLLOWING = actor;
    },
    followThresholdX : 5,
    followThresholdY : 5,
    updateFollow(){
        if(FOLLOWING){
            let x = FOLLOWING.x - ( Jstick.Viewport.width/(Jstick.Camera.zoom*2) );
            let y = FOLLOWING.y - ( Jstick.Viewport.height/(Jstick.Camera.zoom*2) );
            // stabilize vertical scroll
            if( Math.abs( Jstick.Camera.y - y ) < Jstick.Camera.followThresholdY ) Jstick.Camera.scrollAnimation( {x} );
            else Jstick.Camera.scrollAnimation( x,y )
        }
    },


    /*********************************************************************/
    /*
    /* SCROLL METHODS AND PROPERTIES
    /*
    /*********************************************************************/
    get x(){ return SCROLL_X },
    set x(val){ 
        // Note: DONT ROUND.If scroll value is rounded, loses resolution in high scaled canvases. 
        // Keeping float values garantees better precision.
        if( typeof val !== 'number' ) throw new Error('Scroll value must be a number');

        // prevent negative is scroll if disabled
        if( !Jstick.Camera.allowNegativeScrolling && val<0 ) val = 0;
        // limit maxscroll if scroll width has been set
        if( Jstick.Camera.scrollWidth !== false ){
            let maxScroll = Math.max( 0, ( (Jstick.Camera.scrollWidth * Jstick.Camera.zoom) - Jstick.Viewport.width ) / Jstick.Camera.zoom );
            if( val > maxScroll ) val = maxScroll;
        }

        SCROLL_X = val;
        return true;
    },
    get y(){ return SCROLL_Y },
    set y(val){ 
        // Note DONT ROUND.If scroll value is rounded, loses resolution in high scaled canvases. 
        // Keeping float values garantees better precision.
        if( typeof val !== 'number' ) throw new Error('Scroll value must be a number');
        // prevent negative is scroll if disabled
        if( !Jstick.Camera.allowNegativeScrolling && val<0 ) val = 0;
        // limit maxscroll if scroll height has been set
        if( Jstick.Camera.scrollHeight !== false){
            let maxScroll = Math.max( 0, ( (Jstick.Camera.scrollHeight * Jstick.Camera.zoom) - Jstick.Viewport.height ) / Jstick.Camera.zoom );
            if( val > maxScroll ) val = maxScroll;
        }
        SCROLL_Y = val ;
        return true;
    },

    scrollWidth : false,
    scrollHeight: false,
    allowNegativeScrolling : false,
    limitToBoundaries : true,
    
    scrollAnimation(x,y){
        if( typeof x === 'object'){
            x = x.x || false;
            y = x.y || false;
        }else{
            x = x || false;
            y = y || false;
        }

        TARGET_SCROLL = {
            x : x || TARGET_SCROLL.x || Jstick.Camera.x,
            y : y || TARGET_SCROLL.y || Jstick.Camera.y,
        }
    },

    /*********************************************************************/
    /*
    /* ZOOM (scale) METHODS AND PROPERTIES
    /*
    /*********************************************************************/

    get zoom(){ return SCALE },
    set zoom(val){ 
        let previousScale = SCALE;

        // autofit test
        if( Jstick.Camera.scrollHeight * val < Jstick.Viewport.height && val < SCALE ){ 
            TARGET_ZOOM = false;
            return false;
        }
        // .. todo : autofit scrollWidth

        
        if( SCALE < 1 && !Jstick.Camera.allowNegativeZoom ) SCALE = 1;
        else SCALE = val;

    
        let zoomX = TARGET_ZOOM ? TARGET_ZOOM.x : ( Jstick.Viewport.width  / 2);
        let zoomY = TARGET_ZOOM ? TARGET_ZOOM.y : ( Jstick.Viewport.height / 2);
        // calculate the new scroll values
        Jstick.Camera.x += ( zoomX / previousScale ) - ( zoomX / SCALE );
        Jstick.Camera.y += ( zoomY / previousScale ) - ( zoomY / SCALE );
    
        // apply new scale  to MAP and SPRITES layers in a non acumulative way
        Jstick.Viewport.Layers.map.setTransform(1, 0, 0, 1, 0, 0);
        Jstick.Viewport.Layers.sprites.setTransform(1, 0, 0, 1, 0, 0);
        Jstick.Viewport.Layers.map.scale(SCALE, SCALE);
        Jstick.Viewport.Layers.sprites.scale(SCALE, SCALE);

        return SCALE 
    },

    get zoomFactor(){ return ZOOM_MODIFIER },
    set zoomFactor(val){
        ZOOM_MODIFIER = val; 
        return true; 
    },

    allowNegativeZoom : false,
    zoomMin    : 1,
    zoomMax    : 1,

    zoomAnimation( level = 1, x = Jstick.Viewport.width/2, y = Jstick.Viewport.height/2 ){
        TARGET_ZOOM = {
            x : x,
            y : y,
            level : level
        }
    },


    
    updateZoom(){
        if( !TARGET_ZOOM ) return true;
   
        let newZoom;
        let currentZoom = Jstick.Camera.zoom;

        // CALCULATE the new ZOOM level value, according to the zoom direction, and 
        // limit the final value if is bigger than the requested zoom Animation target level
        if( TARGET_ZOOM.level > currentZoom ){
            newZoom = currentZoom + ZOOM_MODIFIER;
            if( newZoom > TARGET_ZOOM.level ){ 
                newZoom = TARGET_ZOOM.level;
                TARGET_ZOOM = false;;
            }
        }else{
            newZoom = currentZoom - ZOOM_MODIFIER;
            if( newZoom < TARGET_ZOOM.level ){
                newZoom = TARGET_ZOOM.level;
                TARGET_ZOOM = false;;
            }
        }
        
        Jstick.Camera.zoom = newZoom;

        return;
    
    },

    updateScroll(){
        if(TARGET_SCROLL && !Jstick.Camera.allowNegativeScrolling){
            if( TARGET_SCROLL.x < 0 ) TARGET_SCROLL.x = 0; 
            if( TARGET_SCROLL.y < 0 ) TARGET_SCROLL.y = 0; 
        }

        // perform  SCALE update if is scheduled
        if( !TARGET_SCROLL ) return;
        if( TARGET_SCROLL.x === false && TARGET_SCROLL.y === false ){
            TARGET_SCROLL = false;
            return;
        }

        let scrollFactor = 2;

        if( TARGET_SCROLL.x !== false ){
            if( SCROLL_X < TARGET_SCROLL.x){
                let target = SCROLL_X + scrollFactor;
                if( target < TARGET_SCROLL.x ) Jstick.Camera.x = target;
                else TARGET_SCROLL.x = false;
            }else{
                let target = SCROLL_X - scrollFactor;
                if( target > TARGET_SCROLL.x ) Jstick.Camera.x = target;
                else TARGET_SCROLL.x = false;
            }
        }

        if( TARGET_SCROLL.y !== false ){
            if( SCROLL_Y < TARGET_SCROLL.y){
                let target = SCROLL_Y + scrollFactor;
                if( target < TARGET_SCROLL.y ) Jstick.Camera.y = target;
                else TARGET_SCROLL.y = false;
            }else{
                let target = SCROLL_Y - scrollFactor;
                if( target > TARGET_SCROLL.y ) Jstick.Camera.y = target;
                else TARGET_SCROLL.y = false;
            }
        }


        return true;
    },

}


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
        let x2 = ( Jstick.Viewport.width / Jstick.Camera.zoom );
        let y2 = ( Jstick.Viewport.height / Jstick.Camera.zoom );

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
            Math.floor( ( x / Jstick.Camera.zoom ) + SCROLL_X ) ,
            Math.floor( ( y / Jstick.Camera.zoom ) + SCROLL_Y )
        ];
    },
    

 
  

}



function onResize(){
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
    Jstick.Viewport.Layers.map.scale(Jstick.Camera.zoom, Jstick.Camera.zoom);

    // apply new scale in a non acumulative way
    Jstick.Viewport.Layers.sprites.setTransform(1, 0, 0, 1, 0, 0);
    Jstick.Viewport.Layers.sprites.scale(Jstick.Camera.zoom, Jstick.Camera.zoom);
}

window.addEventListener( 'resize' , onResize, false );
onResize();



