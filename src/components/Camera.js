import {Jstick} from '../jstick.js';

   

const Camera = function( scene ){
    // handle requests performed without using the keyword 'new'
    // otherwhise the Constructor will fail for the lack of own context (this)
    if( !this ) return new Camera( scene );


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

    this.scene = scene;

    this.follow =  ( actor )=>{
        FOLLOWING = actor;
    };

    this.followThresholdX = 5;
    this.followThresholdY = 5;

    this.updateFollow =()=>{
        if(FOLLOWING){
            let x = FOLLOWING.x - ( Jstick.Viewport.width/(SCALE*2) );
            let y = FOLLOWING.y - ( Jstick.Viewport.height/(SCALE*2) );
            // stabilize vertical scroll
            if( Math.abs( this.y - y ) < this.followThresholdY ) this.scrollAnimation( {x} );
            else this.scrollAnimation( x,y )
        }
    };


    /*********************************************************************/
    /*
    /* SCROLL METHODS AND PROPERTIES
    /*
    /*********************************************************************/
    Object.defineProperty( this, 'x', {
        get : ()=>{ return SCROLL_X },
        set : (val)=>{
            // Note: DONT ROUND.If scroll value is rounded, loses resolution in high scaled canvases. 
            // Keeping float values garantees better precision.
            if( typeof val !== 'number' ) throw new Error('Scroll value must be a number');

            // prevent negative is scroll if disabled
            if( !this.allowNegativeScrolling && val<0 ) val = 0;
            // limit maxscroll if scroll width has been set
            if( this.scene.width !== false ){
                let maxScroll = Math.max( 0, ( (this.scene.width * SCALE) - Jstick.Viewport.width ) / SCALE );
                if( val > maxScroll ) val = maxScroll;
            }
            SCROLL_X = val;
            return true;
        },
        configurable: false
    });

    Object.defineProperty( this, 'y', {
        get : ()=>{ return SCROLL_Y },
        set : (val)=>{
            // Note DONT ROUND.If scroll value is rounded, loses resolution in high scaled canvases. 
            // Keeping float values garantees better precision.
            if( typeof val !== 'number' ) throw new Error('Scroll value must be a number');
            // prevent negative is scroll if disabled
            if( !this.allowNegativeScrolling && val<0 ) val = 0;
            // limit maxscroll if scroll height has been set
            if( this.scene.height !== false){
                let maxScroll = Math.max( 0, ( (this.scene.height * SCALE) - Jstick.Viewport.height ) / SCALE );
                if( val > maxScroll ) val = maxScroll;
            }
            SCROLL_Y = val ;
            return true;
        },
        configurable: false
    });

    this.allowNegativeScrolling = false;
    this.limitToBoundaries = true;
    
    this.scrollAnimation = (x,y)=>{
        if( typeof x === 'object'){
            x = x.x || false;
            y = x.y || false;
        }else{
            x = x || false;
            y = y || false;
        }

        TARGET_SCROLL = {
            x : x || TARGET_SCROLL.x || this.x,
            y : y || TARGET_SCROLL.y || this.y
        }
    };

    /*********************************************************************/
    /*
    /* ZOOM (scale) METHODS AND PROPERTIES
    /*
    /*********************************************************************/

    Object.defineProperty( this, 'zoom', {
        get : ()=>{ return SCALE },
        set : (val)=>{
            let previousScale = SCALE;
            // autofit test
            if( this.scene.height * val < Jstick.Viewport.height && val < SCALE ){ 
                TARGET_ZOOM = false;
                return false;
            }
            // .. todo : autofit scrollWidth

            if( SCALE < 1 && !this.allowNegativeZoom ) SCALE = 1;
            else SCALE = val;
        
            let zoomX = TARGET_ZOOM ? TARGET_ZOOM.x : ( Jstick.Viewport.width  / 2);
            let zoomY = TARGET_ZOOM ? TARGET_ZOOM.y : ( Jstick.Viewport.height / 2);
            // calculate the new scroll values
            this.x += ( zoomX / previousScale ) - ( zoomX / SCALE );
            this.y += ( zoomY / previousScale ) - ( zoomY / SCALE );
        
            // apply new scale  to MAP and SPRITES layers in a non acumulative way
            Jstick.Viewport.Layers.map.setTransform(1, 0, 0, 1, 0, 0);
            Jstick.Viewport.Layers.sprites.setTransform(1, 0, 0, 1, 0, 0);
            Jstick.Viewport.Layers.map.scale(SCALE, SCALE);
            Jstick.Viewport.Layers.sprites.scale(SCALE, SCALE);

            return SCALE 
        },
        configurable: false
    });

    Object.defineProperty( this, 'zoomFactor', {
        get : ()=>{ return ZOOM_MODIFIER },
        set : (val)=>{
            ZOOM_MODIFIER = val; 
            return true; 
        },
        configurable: false
    });


    this.allowNegativeZoom = false;
    this.zoomMin    = 1;
    this.zoomMax    = 1;

    this.zoomAnimation = ( level = 1, x = Jstick.Viewport.width/2, y = Jstick.Viewport.height/2 )=>{
        TARGET_ZOOM = {
            x : x,
            y : y,
            level : level
        }
    };


    this.updateZoom = ()=>{
        if( !TARGET_ZOOM ) return true;
   
        let newZoom;
        let currentZoom = SCALE;

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
        
        this.zoom = newZoom;

        return;
    
    },

    this.updateScroll = ()=>{
        if(TARGET_SCROLL && !this.allowNegativeScrolling){
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
                if( target < TARGET_SCROLL.x ) this.x = target;
                else TARGET_SCROLL.x = false;
            }else{
                let target = SCROLL_X - scrollFactor;
                if( target > TARGET_SCROLL.x ) this.x = target;
                else TARGET_SCROLL.x = false;
            }
        }

        if( TARGET_SCROLL.y !== false ){
            if( SCROLL_Y < TARGET_SCROLL.y){
                let target = SCROLL_Y + scrollFactor;
                if( target < TARGET_SCROLL.y ) this.y = target;
                else TARGET_SCROLL.y = false;
            }else{
                let target = SCROLL_Y - scrollFactor;
                if( target > TARGET_SCROLL.y ) this.y = target;
                else TARGET_SCROLL.y = false;
            }
        }


        return true;
    };

    return this;

}

export {Camera};