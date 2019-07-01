


let Viewport = function( _instance_ , container){
    // initiate variables : canvas ref, offsets, scale...

    let HIDE_DEVICE_CURSOR = false;
    let FULL_SCREEN = false;

    
    /*********************************************************************/
    /*
    /* SIZES AND APPEARENCE PROPERTIES
    /*
    /*********************************************************************/
    this.width     = container.offsetWidth;
    this.height    = container.offsetHeight;
    this.container = container;


    Object.defineProperty( this, 'hideDeviceCursor', {
        get : ()=>{ return HIDE_DEVICE_CURSOR },
        set : (val)=>{
            // Show/hide native device cursor (applies : CSS cursor:none)
            if (typeof val !== "boolean"){
                throw new Error('Jstick.prototype.Viewport.deviceCursor() : Argument 1 must be a Boolean');
            }

            if( val ) this.container.setAttribute('hide-device-cursor',true);
            else this.container.removeAttribute('hide-device-cursor');
            HIDE_DEVICE_CURSOR = val;
            return true;
        },
        configurable : false
    } );

    
    Object.defineProperty( this, 'fullscreen', {
        get : ()=>{ return FULL_SCREEN },
        set : (val)=>{
            if (typeof val !== "boolean"){
                throw new Error('Jstick.prototype.Viewport.fullscreen : Expecting a Boolean');
            }
            if( val ) this.container.setAttribute('viewport-full-screen',true);
            else this.container.removeAttribute('viewport-full-screen');
            FULL_SCREEN = val;
            this.updateSize();
            return true;
        },
        configurable : false
    } );


    this.updateSize = ()=>{
        this.width  = this.container.getBoundingClientRect().width;
        this.height = this.container.getBoundingClientRect().height;
        
        // iterate all layers and apply new viewport size
        for(let layer in _instance_.Renderer.canvasContexts){
            _instance_.Renderer.canvasContexts[layer].canvas.width = this.width;
            _instance_.Renderer.canvasContexts[layer].canvas.height = this.height;
            _instance_.Renderer.canvasContexts[layer].imageSmoothingEnabled = _instance_.Renderer.imageSmoothing;
            // apply new scale in a non acumulative way
            _instance_.Renderer.canvasContexts[layer].setTransform(1, 0, 0, 1, 0, 0);
            _instance_.Renderer.canvasContexts[layer].scale(_instance_.Camera.zoom, _instance_.Camera.zoom);
        }
    };

    window.addEventListener( 'resize' , this.updateSize, false );



    /*********************************************************************/
    /*
    /* EVENTS : Custom handlers methods
    /*
    /*********************************************************************/
    this.onresize      = function(){};
    this.onloseFPSsync = function(){};


    /**
     * 
     * Viewport.getAbsoluteCoordinates() : Transform the provided viewport coordinates to map 
     *                                absolute coordinates, considering map scale and map scroll.
     */
    this.getAbsoluteCoordinates = ( x , y )=>{
        return [
            //Math.floor( ( x / _instance_.Camera.zoom ) ) ,
            //Math.floor( ( y / _instance_.Camera.zoom )  )
            Math.floor( ( x / _instance_.Camera.zoom ) + _instance_.Camera.x ) ,
            Math.floor( ( y / _instance_.Camera.zoom ) + _instance_.Camera.y )
        ];
    }
    
    return this;
};

export {Viewport};






