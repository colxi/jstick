import {throttledAnimation } from '../lib/fps-throttle/src/fps-throttle.js';
import {Sprite , Texture} from '../jstick.js';


const Renderer = function( _instance_ ){
    let IMAGE_SMOOTHING = true;
    let THROTTLED_LOOP;
    this.canvasContexts = {};

    Object.defineProperty( this, 'throttle', {
        get : ()=>{ return THROTTLED_LOOP.throttle },
        set : (val)=>{ return THROTTLED_LOOP.throttle = val },
        configurable : false
    } );

    Object.defineProperty( this, 'fps', {
        get : ()=>{ return THROTTLED_LOOP.fps },
        set : (val)=>{ return val },
        configurable : false
    } );


    this.pause = ()=>{ 
        _instance_.status = false;
        THROTTLED_LOOP.stop() 
    };
    
    this.resume = ()=>{ 
        THROTTLED_LOOP.start() 
        _instance_.status = true;
    };

    this.nextTick = ( timestamp=performance.now() )=>{
        if(_instance_.Scene){
            _instance_.Camera.updateZoom();
            _instance_.Camera.updateScroll();
            _instance_.Camera.updateFollow();
        }
        
        let input = _instance_.Input.getStatus();
        _instance_.Loop.update( timestamp, input );
        _instance_.Loop.draw( timestamp, input );
        // reset some possible events like mousewheel
        _instance_.Input.__update__();
    };


    this.draw = ( item , x, y, target= Object.keys(this.canvasContexts)[0] , flipX=false, flipY=false)=>{
        let scrollX = _instance_.Camera.x;
        let scrollY = _instance_.Camera.y;
        
        let layerScrollFactor = _instance_.Scene.Layers[target].scrollFactor;
        if(layerScrollFactor === 0 ){
            scrollX = 0;
            scrollY = 0;
        }else{
            scrollX = scrollX * layerScrollFactor ;
            scrollY = scrollY * layerScrollFactor;
        }

        target = this.canvasContexts[target];

        if(item instanceof Sprite){
            let source;
            if(flipX && flipY) source = item.cache.flipXY.getImageBitmap();
            else if(flipX) source = item.cache.flipX.getImageBitmap();
            else if(flipY) source = item.cache.flipY.getImageBitmap();
            else source = item.texture.getImageBitmap();
            // console.log(item)
            target.drawImage( 
                source,
                x - scrollX ,
                y - scrollY, 
                item.texture.width, 
                item.texture.height
            );
        }else if(item instanceof Texture){
            target.drawImage( 
                item.getImageBitmap(), 
                x - scrollX ,// ( x - _instance_.Camera.x ), 
                y - scrollY , // ( y - _instance_.Camera.y ), 
                item.width, 
                item.height
            );
        }else{
            /*
            // render Scene
            for(let layer in _instance_.Scene.Layers ){
                let x1 = ( 0 - _instance_.Camera.x );
                let y1 = ( 0 - _instance_.Camera.y );
                let x2 = _instance_.Scene.width ;
                let y2 = _instance_.Scene.height;
                if( !_instance_.Scene.Layers[layer].texture ) continue;
                let img = _instance_.Scene.Layers[layer].texture.getImageBitmap();
                _instance_.Renderer.canvasContexts[layer].drawImage( img, x1, y1, x2, y2 );   
            }
            */
        }
    };


    this.updateLayout = ()=>{
        _instance_.Viewport.container.innerHTML = '';
        
        this.canvasContexts = {};
        let layers = Object.values( _instance_.Scene.Layers ).sort((a, b) => (a.index > b.index) ? 1 : -1)
    
        for(let i=0; i<layers.length; i++){
            let canvas    = document.createElement('canvas');
            canvas.width  = _instance_.Viewport.width;
            canvas.height = _instance_.Viewport.height;
            canvas.setAttribute('data-scene-layer',layers[i].name);
            canvas.getContext('2d').imageSmoothingEnabled = IMAGE_SMOOTHING;
            _instance_.Viewport.container.appendChild(canvas);
            this.canvasContexts[layers[i].name] = canvas.getContext('2d') ;
            // todo: dont apply zoom if layer is not reactive to zoom (layer.zoomFactor)
            this.canvasContexts[layers[i].name].setTransform(1, 0, 0, 1, 0, 0);
            this.canvasContexts[layers[i].name].scale(_instance_.Camera.zoom, _instance_.Camera.zoom);
        }
    };

    Object.defineProperty( this, 'imageSmoothing', {
        get : ()=>{ return IMAGE_SMOOTHING },
        set : (val)=>{
            if( typeof val !== 'boolean' ) throw new Error('Scroll value must be a boolean');
            IMAGE_SMOOTHING = val ;
            for(let layer in this.canvasContexts){
                this.canvasContexts[layer].imageSmoothingEnabled = IMAGE_SMOOTHING;
            }
            return true;
        },
        configurable : false
    } );

    /**
     * Viewport.clear() : Clears the Viewport
     */
    this.clear = ( target = this.canvasContexts )=>{
        //let x2 = ( _instance_.Viewport.width / _instance_.Camera.zoom );
        //let y2 = ( _instance_.Viewport.height / _instance_.Camera.zoom );
        let layers = target;
        if( layers !== this.canvasContexts ){ 
            layers = {};
            layers[ target ] = this.canvasContexts[ target ];
        }
        // Clean map layer
        for(let layer in layers){
            // Store the current transformation matrix
            layers[layer].save();
            // Use the identity matrix while clearing the canvas
            layers[layer].setTransform(1, 0, 0, 1, 0, 0);
            layers[layer].clearRect(0, 0, _instance_.Viewport.width, _instance_.Viewport.height);
            // Restore the transform
            layers[layer].restore();
        }
        return true;
    };



    THROTTLED_LOOP = new throttledAnimation( (timestamp)=>{
        if(!_instance_.status) return;
        _instance_.Renderer.nextTick(timestamp);
    } , 60 );


    return this;
}

export {Renderer};


