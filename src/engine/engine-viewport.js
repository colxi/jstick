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
    width : document.getElementById('map').width,
    height : document.getElementById('map').height,
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

    // allow/disallow scales lower than 1 (scale reduction)
    allowNegativeScale : false,
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
        // Clean map layer
        JStick.Viewport.Layers.map.clearRect(
            0,
            0, 
            JStick.Viewport.width / JStick.Viewport.scale , 
            JStick.Viewport.height / JStick.Viewport.scale
        );

        // clean sprites layer
        JStick.Viewport.Layers.sprites.clearRect( 
            0, 
            0, 
            JStick.Viewport.width / JStick.Viewport.scale , 
            JStick.Viewport.height / JStick.Viewport.scale
        );

        return true;
    },

    drawCursor : function(x,y, cursorSprite){     
        // render cursor
        JStick.Viewport.Layers.sprites.fillStyle = "#FFFFF";

        JStick.Viewport.Layers.sprites.fillRect(
            ( x / JStick.Viewport.scale ) - 5, 
            y  / JStick.Viewport.scale,
            11,
            1
        );
        JStick.Viewport.Layers.sprites.fillRect(
            x / JStick.Viewport.scale, 
            ( y / JStick.Viewport.scale ) - 5  ,
            1,
            11
        );
        return true;
    },


    /**
     * 
     * Viewport.getMapCoordinates() : Transform the provided viewport coordinates to map 
     *                                coordinates, considering map scale and map scroll.
     */
    /*
    getMapCoordinates( x , y ){
        return [
            Math.floor( ( JStick.Viewport.Cursor.x/JStick.Viewport.scale ) + JStick.Viewport.Scroll.x ) ,
            Math.floor( ( JStick.Viewport.Cursor.y/JStick.Viewport.scale ) + JStick.Viewport.Scroll.y )
        ];
    },
    */

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
       
        let x =  TARGET_ZOOM.x;
        let y =  TARGET_ZOOM.y;
        JStick.Viewport.scrollTo( x, y )

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
                if( target < TARGET_SCROLL ) JStick.Viewport.Scroll.x = target;
                else TARGET_SCROLL.x = false;
            }else{
                let target = JStick.Viewport.Scroll.x - scrollFactor;
                if( target > TARGET_SCROLL ) JStick.Viewport.Scroll.x = target;
                else TARGET_SCROLL.x = false;
            }
        }

        if( TARGET_SCROLL.y !== false ){
            if( JStick.Viewport.Scroll.y < TARGET_SCROLL.y){
                let target = JStick.Viewport.Scroll.y + scrollFactor;
                if( target < TARGET_SCROLL ) JStick.Viewport.Scroll.y = target;
                else TARGET_SCROLL.y = false;
            }else{
                let target = JStick.Viewport.Scroll.y - scrollFactor;
                if( target > TARGET_SCROLL ) JStick.Viewport.Scroll.y = target;
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
    zoomTo( level = JStick.Viewport.scaleFactor, x = Math.round(JStick.Viewport.width/2), y = Math.round(JStick.Viewport.height/2) ){
        TARGET_ZOOM = {
            x : x,
            y : y,
            level : level
        }
    },

    scrollTo(x,y){
        TARGET_SCROLL= {
            x : x,
            y : y,
        }
    }
}



JStick.Viewport.Layers.map.imageSmoothingEnabled     = false;
JStick.Viewport.Layers.sprites.imageSmoothingEnabled = false;

