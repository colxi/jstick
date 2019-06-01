import {Jstick} from '../Jstick.js';

   
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

let FOLLOWING = undefined;

Jstick.Camera = {
    follow( actor ){
        FOLLOWING = actor;
    },

    updateFollow(){
        if(FOLLOWING){
            let x = FOLLOWING.x - ( Jstick.Viewport.width/(Jstick.Viewport.scale*2) );
            let y = FOLLOWING.y - ( Jstick.Viewport.height/(Jstick.Viewport.scale*2) );
            // stabilize vertical scroll
            if( Math.abs( Jstick.Viewport.scrollY - y ) < 2 ) Jstick.Viewport.scrollAnimation( {x} );
            else Jstick.Viewport.scrollAnimation( x,y )
        }
    },

    zoom       : 1,
    zoomFactor : 0.5,
    zoomMin    : 1,
    zoomMax    : 1,
    zoomAnimation(){

    },
    x : 0,
    y : 0,
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
    /* SCROLL METHODS AND PROPERTIES
    /*
    /*********************************************************************/
    get scrollX(){ return SCROLL_X },
    set scrollX(val){ 
        // Note: DONT ROUND.If scroll value is rounded, loses resolution in high scaled canvases. 
        // Keeping float values garantees better precision.
        if( typeof val !== 'number' ) throw new Error('Scroll value must be a number');
        // prevent negative is scroll if disabled
        if( !Jstick.Viewport.allowNegativeScrolling && val<0 ) val = 0;
        // limit maxscroll if scroll width has been set
        if( Jstick.Viewport.scrollWidth!==false){
            let maxScroll = Math.max( 0, ( (Jstick.Viewport.scrollWidth * Jstick.Viewport.scale) - Jstick.Viewport.width ) / Jstick.Viewport.scale );
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
        if( !Jstick.Viewport.allowNegativeScrolling && val<0 ) val = 0;
        // limit maxscroll if scroll height has been set
        if( Jstick.Viewport.scrollHeight!==false){
            let maxScroll = Math.max( 0, ( (Jstick.Viewport.scrollHeight * Jstick.Viewport.scale) - Jstick.Viewport.height ) / Jstick.Viewport.scale );
            if( val > maxScroll ) val = maxScroll;
        }
        SCROLL_Y = val ;
        return true;
    },
    
    scrollWidth : false,
    scrollHeight: false,
    allowNegativeScrolling : false,
    
    scrollAnimation(x,y){
        if( typeof x === 'object'){
            x = x.x || false;
            y = x.y || false;
        }else{
            x = x || false;
            y = y || false;
        }

        TARGET_SCROLL = {
            x : x || TARGET_SCROLL.x || Jstick.Viewport.scrollX,
            y : y || TARGET_SCROLL.y || Jstick.Viewport.scrollY,
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
    
    zoomTo( level = 1, x = Jstick.Viewport.width/2, y = Jstick.Viewport.height/2 ){
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
        let x2 = ( Jstick.Viewport.width / Jstick.Viewport.scale );
        let y2 = ( Jstick.Viewport.height / Jstick.Viewport.scale );

        // Clean map layer
        Jstick.Viewport.Layers.map.clearRect( 0, 0, x2, y2 );
        // clean sprites layer
        Jstick.Viewport.Layers.sprites.clearRect( 0, 0, x2, y2 );
        return true;
    },

    drawCursor : function(x,y, cursorSprite){     
        x = ( x / Jstick.Viewport.scale ); 
        y = ( y  / Jstick.Viewport.scale );

        // render cursor
        Jstick.Viewport.Layers.sprites.fillStyle = "#FFFFF";
        Jstick.Viewport.Layers.sprites.fillRect( x - 5, y, 11, 1 );
        Jstick.Viewport.Layers.sprites.fillRect( x, y - 5, 1, 11 );
        return true;
    },


    /**
     * 
     * Viewport.getMapCoordinates() : Transform the provided viewport coordinates to map 
     *                                coordinates, considering map scale and map scroll.
     */
    
    toMapCoordinates( x , y ){
        return [
            Math.floor( ( x / Jstick.Viewport.scale ) + SCROLL_X ) ,
            Math.floor( ( y / Jstick.Viewport.scale ) + SCROLL_Y )
        ];
    },
    

    updateZoom(){
        if( !TARGET_ZOOM ) return true;

        let previousScale = Jstick.Viewport.scale;
  
        // if Zoom reached the expected level, disable zoom scheduler and return
        if( Jstick.Viewport.scale === TARGET_ZOOM.level  ){
            TARGET_ZOOM = false;
            return;
        }

        if( TARGET_ZOOM.level > Jstick.Viewport.scale ){
            // ZOM IN, apply a Viewport.scaleStep scale ipncrease
            Jstick.Viewport.scale += ZOOM_MODIFIER;
            // if applying increment, zoom level became bigger than target zoom, limit it
            if( Jstick.Viewport.scale > TARGET_ZOOM.level ) Jstick.Viewport.scale = TARGET_ZOOM.level;
        }else{
            // ZOM OUT
            Jstick.Viewport.scale -= ZOOM_MODIFIER;
            // if applying increment, zoom level became bigger than target zoom, limit it
            if( Jstick.Viewport.scale < TARGET_ZOOM.level ) Jstick.Viewport.scale = TARGET_ZOOM.level;
        }

        if( Jstick.Viewport.scale < 1 && !Jstick.Viewport.allowNegativeScale ) Jstick.Viewport.scale = 1;
        
    
        // calculate the new scroll values
        Jstick.Viewport.scrollX += ( TARGET_ZOOM.x / previousScale ) - ( TARGET_ZOOM.x / Jstick.Viewport.scale);
        Jstick.Viewport.scrollY += ( TARGET_ZOOM.y / previousScale ) - ( TARGET_ZOOM.y / Jstick.Viewport.scale);
    
        // apply new scale in a non acumulative way
        Jstick.Viewport.Layers.map.setTransform(1, 0, 0, 1, 0, 0);
        Jstick.Viewport.Layers.map.scale(Jstick.Viewport.scale, Jstick.Viewport.scale);

        // apply new scale in a non acumulative way
        Jstick.Viewport.Layers.sprites.setTransform(1, 0, 0, 1, 0, 0);
        Jstick.Viewport.Layers.sprites.scale(Jstick.Viewport.scale, Jstick.Viewport.scale);

        return true;
    },

    updateScroll(){
        if(TARGET_SCROLL && !Jstick.Viewport.allowNegativeScrolling){
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
                if( target < TARGET_SCROLL.x ) Jstick.Viewport.scrollX = target;
                else TARGET_SCROLL.x = false;
            }else{
                let target = SCROLL_X - scrollFactor;
                if( target > TARGET_SCROLL.x ) Jstick.Viewport.scrollX = target;
                else TARGET_SCROLL.x = false;
            }
        }

        if( TARGET_SCROLL.y !== false ){
            if( SCROLL_Y < TARGET_SCROLL.y){
                let target = SCROLL_Y + scrollFactor;
                if( target < TARGET_SCROLL.y ) Jstick.Viewport.scrollY = target;
                else TARGET_SCROLL.y = false;
            }else{
                let target = SCROLL_Y - scrollFactor;
                if( target > TARGET_SCROLL.y ) Jstick.Viewport.scrollY = target;
                else TARGET_SCROLL.y = false;
            }
        }


        return true;
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
    Jstick.Viewport.Layers.map.scale(Jstick.Viewport.scale, Jstick.Viewport.scale);

    // apply new scale in a non acumulative way
    Jstick.Viewport.Layers.sprites.setTransform(1, 0, 0, 1, 0, 0);
    Jstick.Viewport.Layers.sprites.scale(Jstick.Viewport.scale, Jstick.Viewport.scale);
}

window.addEventListener( 'resize' , onResize, false );
onResize();



