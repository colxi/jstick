import {Jstick} from '../jstick.js';


let IMAGE_SMOOTHING = false;


Jstick.RenderEngine = {
    activeScene : null,
    
    setScene( scene ){
        Jstick.Viewport.container.innerHTML = '';
        
        Jstick.Viewport.Layers = {};
        let layers = Object.values( scene.Layers ).sort((a, b) => (a.index > b.index) ? 1 : -1)
    
        for(let i=0; i<layers.length; i++){
            let canvas    = document.createElement('canvas');
            canvas.width  = Jstick.Viewport.width;
            canvas.height = Jstick.Viewport.height;
            canvas.setAttribute('data-scene-layer',layers[i].name);
            canvas.getContext('2d').imageSmoothingEnabled = IMAGE_SMOOTHING;
            Jstick.Viewport.container.appendChild(canvas);
            Jstick.Viewport.Layers[layers[i].name] = canvas.getContext('2d') ;

            Jstick.Viewport.Layers[layers[i].name].setTransform(1, 0, 0, 1, 0, 0);
            Jstick.Viewport.Layers[layers[i].name].scale(scene.Camera.zoom, scene.Camera.zoom);
        }
        Jstick.RenderEngine.activeScene = scene;
    },

    
    // Enable/disable imageSmoothing
    get imageSmoothing(){ return IMAGE_SMOOTHING },
    set imageSmoothing( val ){ 
        if( typeof val !== 'boolean' ) throw new Error('Scroll value must be a boolean');
        IMAGE_SMOOTHING = val ;
        for(let layer in Jstick.Viewport.Layers){
            Jstick.Viewport.Layers[layer].imageSmoothingEnabled = IMAGE_SMOOTHING;
        }
        return true;
    },

    /**
     * Viewport.clear() : Clears the Viewport
     */
    clear(){
        let x2 = ( Jstick.Viewport.width / Jstick.RenderEngine.activeScene.Camera.zoom );
        let y2 = ( Jstick.Viewport.height / Jstick.RenderEngine.activeScene.Camera.zoom );

        // Clean map layer
        for(let layer in Jstick.Viewport.Layers){
            Jstick.Viewport.Layers[layer].clearRect( 0, 0, x2, y2 );
        }
        return true;
    },


}


function onResize(){
    if( !Jstick.RenderEngine.activeScene ) return
    Jstick.Viewport.width = Jstick.Viewport.container.offsetWidth;
    Jstick.Viewport.height = Jstick.Viewport.container.offsetHeight;
    
    // iterate all layers and apply new viewport size
    for(let layer in Jstick.Viewport.Layers){
        Jstick.Viewport.Layers[layer].canvas.width = Jstick.Viewport.width;
        Jstick.Viewport.Layers[layer].canvas.height = Jstick.Viewport.height;
        Jstick.Viewport.Layers[layer].imageSmoothingEnabled     = IMAGE_SMOOTHING;
        // apply new scale in a non acumulative way
        Jstick.Viewport.Layers[layer].setTransform(1, 0, 0, 1, 0, 0);
        Jstick.Viewport.Layers[layer].scale(Jstick.RenderEngine.activeScene.Camera.zoom, Jstick.RenderEngine.activeScene.Camera.zoom);
    }
}

window.addEventListener( 'resize' , onResize, false );
onResize();


