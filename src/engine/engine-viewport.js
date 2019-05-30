import {JStick} from '../jstick.js';

   
// initiate variables : canvas ref, offsets, scale...

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

let HIDE_DEVICE_CURSOR = false;

let SCROLL_X = 0;
let SCROLL_Y = 0;

let IMAGE_SMOOTHING = false;

// zoom modifier to apply in each step until target zoom is reached
let ZOOM_MODIFIER = 0.05;

JStick.Viewport = {
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

        if( value ) JStick.Viewport.Layers.container.setAttribute('hide-device-cursor',true);
        else JStick.Viewport.Layers.container.removeAttribute('hide-device-cursor');
        HIDE_DEVICE_CURSOR = value;
        return true;
    },

    // Enable/disable imageSmoothing
    get imageSmoothing(){ return IMAGE_SMOOTHING },
    set imageSmoothing( val ){ 
        if( typeof val !== 'boolean' ) throw new Error('Scroll value must be a boolean');
        IMAGE_SMOOTHING = val ;
        JStick.Viewport.Layers.map.imageSmoothingEnabled     = IMAGE_SMOOTHING;
        JStick.Viewport.Layers.sprites.imageSmoothingEnabled = IMAGE_SMOOTHING;
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
    /* SCROLL METHODS AND PROPERTIES
    /*
    /*********************************************************************/
    get scrollX(){ return SCROLL_X },
    set scrollX(val){ 
        // Note: DONT ROUND.If scroll value is rounded, loses resolution in high scaled canvases. 
        // Keeping float values garantees better precision.
        if( typeof val !== 'number' ) throw new Error('Scroll value must be a number');
        // prevent negative is scroll if disabled
        if( !JStick.Viewport.allowNegativeScrolling && val<0 ) val = 0;
        // limit maxscroll if scroll width has been set
        if( JStick.Viewport.scrollWidth!==false){
            let maxScroll = Math.max( 0, ( (JStick.Viewport.scrollWidth * JStick.Viewport.scale) - JStick.Viewport.width ) / JStick.Viewport.scale );
            if( val > maxScroll ) val = maxScroll;
        }
        SCROLL_X = val;
        return true;
    },
    get scrollY(){ return SCROLL_Y },
    set scrollY(val){ 
        // Note DONT ROUND.If scroll value is rounded, loses resolution in high scaled canvases. 
        // Keeping float values garantees better precision.
        if( typeof val !== 'number' ) throw new Error('Scroll value must be a number');
        // prevent negative is scroll if disabled
        if( !JStick.Viewport.allowNegativeScrolling && val<0 ) val = 0;
        // limit maxscroll if scroll height has been set
        if( JStick.Viewport.scrollHeight!==false){
            let maxScroll = Math.max( 0, ( (JStick.Viewport.scrollHeight * JStick.Viewport.scale) - JStick.Viewport.height ) / JStick.Viewport.scale );
            if( val > maxScroll ) val = maxScroll;
        }
        SCROLL_Y = val ;
        return true;
    },
    
    scrollWidth : false,
    scrollHeight: false,
    allowNegativeScrolling : false,
    
    scrollAnimation(x,y){
        TARGET_SCROLL = {
            x : x,
            y : y,
        }
    },

    /*********************************************************************/
    /*
    /* ZOOM (scale) METHODS AND PROPERTIES
    /*
    /*********************************************************************/

    // allow/disallow scales lower than 1 (scale reduction)
    allowNegativeScale : false,
    // current scale
    scale : 1,

    Zoom : {
        factor  : 0, 
        max     : 2,
        min     : 1,
    },
    
    zoomTo( level = 1, x = JStick.Viewport.width/2, y = JStick.Viewport.height/2 ){
        TARGET_ZOOM = {
            x : x,
            y : y,
            level : level
        }
    },

    /*********************************************************************/
    /*
    /* EVENTS : Custom handlers methods
    /*
    /*********************************************************************/

    onresize      : function(){},
    onloseFPSsync : function(){},




    defineSceneSize(){} , // sets the width and the height of a scene, this values are used for automatic streching and fitting

   


    /**
     * Viewport.clear() : Clears the Viewport
     */
    clear(){
        let x2 = ( JStick.Viewport.width / JStick.Viewport.scale );
        let y2 = ( JStick.Viewport.height / JStick.Viewport.scale );

        // Clean map layer
        JStick.Viewport.Layers.map.clearRect( 0, 0, x2, y2 );
        // clean sprites layer
        JStick.Viewport.Layers.sprites.clearRect( 0, 0, x2, y2 );
        return true;
    },

    drawCursor : function(x,y, cursorSprite){     
        x = ( x / JStick.Viewport.scale ); 
        y = ( y  / JStick.Viewport.scale );

        // render cursor
        JStick.Viewport.Layers.sprites.fillStyle = "#FFFFF";
        JStick.Viewport.Layers.sprites.fillRect( x - 5, y, 11, 1 );
        JStick.Viewport.Layers.sprites.fillRect( x, y - 5, 1, 11 );
        return true;
    },


    /**
     * 
     * Viewport.getMapCoordinates() : Transform the provided viewport coordinates to map 
     *                                coordinates, considering map scale and map scroll.
     */
    
    toMapCoordinates( x , y ){
        return [
            Math.floor( ( x / JStick.Viewport.scale ) + SCROLL_X ) ,
            Math.floor( ( y / JStick.Viewport.scale ) + SCROLL_Y )
        ];
    },
    

    updateZoom(){
        if( !TARGET_ZOOM ) return true;

        let previousScale = JStick.Viewport.scale;
  
        // if Zoom reached the expected level, disable zoom scheduler and return
        if( JStick.Viewport.scale === TARGET_ZOOM.level  ){
            TARGET_ZOOM = false;
            return;
        }

        if( TARGET_ZOOM.level > JStick.Viewport.scale ){
            // ZOM IN, apply a Viewport.scaleStep scale ipncrease
            JStick.Viewport.scale += ZOOM_MODIFIER;
            // if applying increment, zoom level became bigger than target zoom, limit it
            if( JStick.Viewport.scale > TARGET_ZOOM.level ) JStick.Viewport.scale = TARGET_ZOOM.level;
        }else{
            // ZOM OUT
            JStick.Viewport.scale -= ZOOM_MODIFIER;
            // if applying increment, zoom level became bigger than target zoom, limit it
            if( JStick.Viewport.scale < TARGET_ZOOM.level ) JStick.Viewport.scale = TARGET_ZOOM.level;
        }

        if( JStick.Viewport.scale < 1 && !JStick.Viewport.allowNegativeScale ) JStick.Viewport.scale = 1;
        
    
        // calculate the new scroll values
        JStick.Viewport.scrollX += ( TARGET_ZOOM.x / previousScale ) - ( TARGET_ZOOM.x / JStick.Viewport.scale);
        JStick.Viewport.scrollY += ( TARGET_ZOOM.y / previousScale ) - ( TARGET_ZOOM.y / JStick.Viewport.scale);
    
        // apply new scale in a non acumulative way
        JStick.Viewport.Layers.map.setTransform(1, 0, 0, 1, 0, 0);
        JStick.Viewport.Layers.map.scale(JStick.Viewport.scale, JStick.Viewport.scale);

        // apply new scale in a non acumulative way
        JStick.Viewport.Layers.sprites.setTransform(1, 0, 0, 1, 0, 0);
        JStick.Viewport.Layers.sprites.scale(JStick.Viewport.scale, JStick.Viewport.scale);

        return true;
    },

    updateScroll(){
        if(TARGET_SCROLL && !JStick.Viewport.allowNegativeScrolling){
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
                if( target < TARGET_SCROLL.x ) JStick.Viewport.scrollX = target;
                else TARGET_SCROLL.x = false;
            }else{
                let target = SCROLL_X - scrollFactor;
                if( target > TARGET_SCROLL.x ) JStick.Viewport.scrollX = target;
                else TARGET_SCROLL.x = false;
            }
        }

        if( TARGET_SCROLL.y !== false ){
            if( SCROLL_Y < TARGET_SCROLL.y){
                let target = SCROLL_Y + scrollFactor;
                if( target < TARGET_SCROLL.y ) JStick.Viewport.scrollY = target;
                else TARGET_SCROLL.y = false;
            }else{
                let target = SCROLL_Y - scrollFactor;
                if( target > TARGET_SCROLL.y ) JStick.Viewport.scrollY = target;
                else TARGET_SCROLL.y = false;
            }
        }


        return true;
    },

 
  

}



function onResize(){
    JStick.Viewport.width = document.getElementById('container').offsetWidth;
    JStick.Viewport.height = document.getElementById('container').offsetHeight;
    
    document.getElementById('map').width = JStick.Viewport.width;
    document.getElementById('map').height = JStick.Viewport.height;
    
    document.getElementById('sprites').width = JStick.Viewport.width;
    document.getElementById('sprites').height = JStick.Viewport.height;

    JStick.Viewport.Layers.map.imageSmoothingEnabled     = JStick.Viewport.imageSmoothing;
    JStick.Viewport.Layers.sprites.imageSmoothingEnabled = JStick.Viewport.imageSmoothing;
    
    // apply new scale in a non acumulative way
    JStick.Viewport.Layers.map.setTransform(1, 0, 0, 1, 0, 0);
    JStick.Viewport.Layers.map.scale(JStick.Viewport.scale, JStick.Viewport.scale);

    // apply new scale in a non acumulative way
    JStick.Viewport.Layers.sprites.setTransform(1, 0, 0, 1, 0, 0);
    JStick.Viewport.Layers.sprites.scale(JStick.Viewport.scale, JStick.Viewport.scale);
}

window.addEventListener( 'resize' , onResize, false );
onResize();



