import {Jstick} from '../jstick.js';
import {Sprite} from '../components/Sprite.js';
import {Texture} from '../components/Texture.js';


let IMAGE_SMOOTHING = false;

let FULL_SCREEN = false;


Jstick.RenderEngine = {
    activeScene : null,

    canvasContexts : {},

    // Show/hide native device cursor (applies : CSS cursor:none)
    get fullscreen(){ return FULL_SCREEN },
    set fullscreen( value ){
        if (typeof value !== "boolean"){
            throw new Error('Viewport.fullScreen() : Argument 1 must be a Boolean');
        }

        if( value ) Jstick.Viewport.container.setAttribute('viewport-full-screen',true);
        else Jstick.Viewport.container.removeAttribute('viewport-full-screen');
        FULL_SCREEN = value;
        onResize();
        return true;
    },

    draw( item , x, y, target= Object.keys(Jstick.RenderEngine.canvasContexts)[0] , flipX=false, flipY=false){
        let scrollX = Jstick.RenderEngine.activeScene.Camera.x;
        let scrollY = Jstick.RenderEngine.activeScene.Camera.y;
        
        let layerScrollFactor = Jstick.RenderEngine.activeScene.Layers[target].scrollFactor;
        if(layerScrollFactor === 0 ){
            scrollX = 0;
            scrollY = 0;
        }else{
            scrollX = scrollX * layerScrollFactor ;
            scrollY = scrollY * layerScrollFactor;
        }

        target = Jstick.RenderEngine.canvasContexts[target];

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
                x - scrollX ,// ( x - Jstick.RenderEngine.activeScene.Camera.x ), 
                y - scrollY , // ( y - Jstick.RenderEngine.activeScene.Camera.y ), 
                item.width, 
                item.height
            );
        }else{
            /*
            // render Scene
            for(let layer in Jstick.RenderEngine.activeScene.Layers ){
                let x1 = ( 0 - Jstick.RenderEngine.activeScene.Camera.x );
                let y1 = ( 0 - Jstick.RenderEngine.activeScene.Camera.y );
                let x2 = Jstick.RenderEngine.activeScene.width ;
                let y2 = Jstick.RenderEngine.activeScene.height;
                if( !Jstick.RenderEngine.activeScene.Layers[layer].texture ) continue;
                let img = Jstick.RenderEngine.activeScene.Layers[layer].texture.getImageBitmap();
                Jstick.RenderEngine.canvasContexts[layer].drawImage( img, x1, y1, x2, y2 );   
            }
            */
        }
    },

    output( containerID ){
        let container = document.querySelector(containerID);
        if(!containerID) throw new Error('Container element not found('+containerID+')');
        Jstick.Viewport.container = container;
        Jstick.Viewport.width     = container.offsetWidth;
        Jstick.Viewport.height    = container.offsetHeight;
    },

    
    input( scene ){
        Jstick.Viewport.container.innerHTML = '';
        
        Jstick.RenderEngine.canvasContexts = {};
        let layers = Object.values( scene.Layers ).sort((a, b) => (a.index > b.index) ? 1 : -1)
    
        for(let i=0; i<layers.length; i++){
            let canvas    = document.createElement('canvas');
            canvas.width  = Jstick.Viewport.width;
            canvas.height = Jstick.Viewport.height;
            canvas.setAttribute('data-scene-layer',layers[i].name);
            canvas.getContext('2d').imageSmoothingEnabled = IMAGE_SMOOTHING;
            Jstick.Viewport.container.appendChild(canvas);
            Jstick.RenderEngine.canvasContexts[layers[i].name] = canvas.getContext('2d') ;
            // todo: dont apply zoom if layer is not reactive to zoom (layer.zoomFactor)
            Jstick.RenderEngine.canvasContexts[layers[i].name].setTransform(1, 0, 0, 1, 0, 0);
            Jstick.RenderEngine.canvasContexts[layers[i].name].scale(scene.Camera.zoom, scene.Camera.zoom);
        }
        Jstick.RenderEngine.activeScene = scene;
    },

    
    // Enable/disable imageSmoothing
    get imageSmoothing(){ return IMAGE_SMOOTHING },
    set imageSmoothing( val ){ 
        if( typeof val !== 'boolean' ) throw new Error('Scroll value must be a boolean');
        IMAGE_SMOOTHING = val ;
        for(let layer in Jstick.RenderEngine.canvasContexts){
            Jstick.RenderEngine.canvasContexts[layer].imageSmoothingEnabled = IMAGE_SMOOTHING;
        }
        return true;
    },

    /**
     * Viewport.clear() : Clears the Viewport
     */
    clear( target = Jstick.RenderEngine.canvasContexts ){
        //let x2 = ( Jstick.Viewport.width / Jstick.RenderEngine.activeScene.Camera.zoom );
        //let y2 = ( Jstick.Viewport.height / Jstick.RenderEngine.activeScene.Camera.zoom );
        let layers = target;
        if( layers !== Jstick.RenderEngine.canvasContexts ){ 
            layers = {};
            layers[ target ] = Jstick.RenderEngine.canvasContexts[ target ];
        }
        // Clean map layer
        for(let layer in layers){
            let context = layers[layer];
            // Store the current transformation matrix
            context.save();

            // Use the identity matrix while clearing the canvas
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.clearRect(0, 0, Jstick.Viewport.width, Jstick.Viewport.height);

            // Restore the transform
            context.restore();

        // Jstick.RenderEngine.canvasContexts[layer].clearRect( 0, 0, x2, y2 );
        }
        return true;
    },


}


function onResize(){
    if( !Jstick.RenderEngine.activeScene ) return
    Jstick.Viewport.width = Jstick.Viewport.container.offsetWidth;
    Jstick.Viewport.height = Jstick.Viewport.container.offsetHeight;
    
    // iterate all layers and apply new viewport size
    for(let layer in Jstick.RenderEngine.canvasContexts){
        Jstick.RenderEngine.canvasContexts[layer].canvas.width = Jstick.Viewport.width;
        Jstick.RenderEngine.canvasContexts[layer].canvas.height = Jstick.Viewport.height;
        Jstick.RenderEngine.canvasContexts[layer].imageSmoothingEnabled = IMAGE_SMOOTHING;
        // apply new scale in a non acumulative way
        Jstick.RenderEngine.canvasContexts[layer].setTransform(1, 0, 0, 1, 0, 0);
        Jstick.RenderEngine.canvasContexts[layer].scale(Jstick.RenderEngine.activeScene.Camera.zoom, Jstick.RenderEngine.activeScene.Camera.zoom);
    }
}

window.addEventListener( 'resize' , onResize, false );
onResize();


