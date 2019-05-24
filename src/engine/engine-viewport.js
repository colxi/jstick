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



JStick.Viewport = {
    width : document.getElementById('container').offsetWidth << 0,
    height : document.getElementById('container').offsetHeight << 0,

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

    Scroll : {
        x : 0,
        y : 0
    },
    imageSmoothing: false,

    // allow/disallow scales lower than 1 (scale reduction)
    allowNegativeScale : false,
    allowNegativeScroll : false,
    // current scale
    scale : 1,
    // default zoom modifier to apply 
    scaleFactor : 1,
    // zoom modifier to apply in each step until target zoom is reached
    scaleStep : 0.05,

    // native cursor
    hideDeviceCursor( value ){
        if (typeof value !== "boolean"){
            throw new Error('Viewport.deviceCursor() : Argument 1 must be a Boolean');
        }

        if( value ) JStick.Viewport.Layers.container.setAttribute('hide-device-cursor',true);
        else JStick.Viewport.Layers.container.removeAttribute('hide-device-cursor');
        return true;
    },

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
            Math.floor( ( x / JStick.Viewport.scale ) + JStick.Viewport.Scroll.x ) ,
            Math.floor( ( y / JStick.Viewport.scale ) + JStick.Viewport.Scroll.y )
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
            JStick.Viewport.scale += JStick.Viewport.scaleStep;
            // if applying increment, zoom level became bigger than target zoom, limit it
            if( JStick.Viewport.scale > TARGET_ZOOM.level ) JStick.Viewport.scale = TARGET_ZOOM.level;
        }else{
            // ZOM OUT
            JStick.Viewport.scale -= JStick.Viewport.scaleStep;
            // if applying increment, zoom level became bigger than target zoom, limit it
            if( JStick.Viewport.scale < TARGET_ZOOM.level ) JStick.Viewport.scale = TARGET_ZOOM.level;
        }

        if( JStick.Viewport.scale < 1 && !JStick.Viewport.allowNegativeScale ) JStick.Viewport.scale = 1;
        
        // calculate the new scroll values
        JStick.Viewport.Scroll.x += ( TARGET_ZOOM.x / previousScale ) - ( TARGET_ZOOM.x / JStick.Viewport.scale);
        JStick.Viewport.Scroll.y += ( TARGET_ZOOM.y / previousScale ) - ( TARGET_ZOOM.y / JStick.Viewport.scale);
       
        //let x =  TARGET_ZOOM.x;
        //let y =  TARGET_ZOOM.y;
        //JStick.Viewport.scrollTo( x, y )

        // experimental : limit scroll to prevent negative scrolls
        //if( JStick.Viewport.Scroll.x < 0) JStick.Viewport.Scroll.x = 0;
        //if( JStick.Viewport.Scroll.y < 0) JStick.Viewport.Scroll.y = 0;
    
        // apply new scale in a non acumulative way
        JStick.Viewport.Layers.map.setTransform(1, 0, 0, 1, 0, 0);
        JStick.Viewport.Layers.map.scale(JStick.Viewport.scale, JStick.Viewport.scale);

        // apply new scale in a non acumulative way
        JStick.Viewport.Layers.sprites.setTransform(1, 0, 0, 1, 0, 0);
        JStick.Viewport.Layers.sprites.scale(JStick.Viewport.scale, JStick.Viewport.scale);

        return true;
    },

    updateScroll(){
        if(!JStick.Viewport.allowNegativeScroll){
            if( JStick.Viewport.Scroll.x < 0 ) JStick.Viewport.Scroll.x = 0; 
            if( JStick.Viewport.Scroll.y < 0 ) JStick.Viewport.Scroll.y = 0; 
        }
        
        if(TARGET_SCROLL && !JStick.Viewport.allowNegativeScroll){
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
            if( JStick.Viewport.Scroll.x < TARGET_SCROLL.x){
                let target = JStick.Viewport.Scroll.x + scrollFactor;
                if( target < TARGET_SCROLL.x ) JStick.Viewport.Scroll.x = target;
                else TARGET_SCROLL.x = false;
            }else{
                let target = JStick.Viewport.Scroll.x - scrollFactor;
                if( target > TARGET_SCROLL.x ) JStick.Viewport.Scroll.x = target;
                else TARGET_SCROLL.x = false;
            }
        }

        if( TARGET_SCROLL.y !== false ){
            if( JStick.Viewport.Scroll.y < TARGET_SCROLL.y){
                let target = JStick.Viewport.Scroll.y + scrollFactor;
                if( target < TARGET_SCROLL.y ) JStick.Viewport.Scroll.y = target;
                else TARGET_SCROLL.y = false;
            }else{
                let target = JStick.Viewport.Scroll.y - scrollFactor;
                if( target > TARGET_SCROLL.y ) JStick.Viewport.Scroll.y = target;
                else TARGET_SCROLL.y = false;
            }
        }


        return true;
    },

    /**
     * 
     * Viewport.zoomTo() : With the provided zoom factor, perform a zoom at the provided Viewport coordinates.
     *                      If no zoom factor is provided use JStick.Viewport.scaleFactor default value, and if no coordinates
     *                      are provided use the center of the vieport, as zooming target coordinates
     * 
     */
    zoomTo( level = JStick.Viewport.scaleFactor, x = JStick.Viewport.width/2, y = JStick.Viewport.height/2 ){
        TARGET_ZOOM = {
            x : x,
            y : y,
            level : level
        }
    },

    scrollTo(x,y){
        TARGET_SCROLL = {
            x : x,
            y : y,
        }
    }
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



