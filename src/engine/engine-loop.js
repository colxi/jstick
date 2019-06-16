import {Jstick} from '../jstick.js';
import {throttledAnimation } from '../lib/fps-throttle/src/fps-throttle.js';

let GAMELOOP;

Jstick.Loop = {
    update(){
        // user provided 
    },

    draw(){
        // user provided 
    },

    set throttle(val){ return GAMELOOP.throttle = val },
    get throttle(){ return GAMELOOP.throttle },

    get fps(){ return GAMELOOP.fps },
    set fps(val){ return val },

    pause(){ 
        Jstick.status = false;
        GAMELOOP.stop() 
    },
    
    resume(){ 
        GAMELOOP.start() 
        Jstick.status = true;
    },

    nextTick( timestamp=performance.now() ){
        if(Jstick.RenderEngine.activeScene){
            Jstick.RenderEngine.activeScene.Camera.updateZoom();
            Jstick.RenderEngine.activeScene.Camera.updateScroll();
            Jstick.RenderEngine.activeScene.Camera.updateFollow();
        }
        
        let input = Jstick.Input.getStatus();
        Jstick.Loop.update( timestamp, input );
        Jstick.Loop.draw( timestamp, input );
        Jstick.Loop._renderCameraView();
        if( Jstick.showInfo ) Jstick.updateInfo();
        // reset some possible events like mousewheel
        Jstick.Input.__update__();
    },

    _renderCameraView(){
        if( !Jstick.RenderEngine.activeScene ) return;
        let x1 = ( 0 - Jstick.RenderEngine.activeScene.Camera.x );
        let y1 = ( 0 - Jstick.RenderEngine.activeScene.Camera.y );
        let x2 = Jstick.RenderEngine.activeScene.width ;
        let y2 = Jstick.RenderEngine.activeScene.height;
        // Draw map data in canvas
        Jstick.RenderEngine.clear()
        for(let layer in Jstick.RenderEngine.activeScene.Layers ){
            if( !Jstick.RenderEngine.activeScene.Layers[layer].texture ) continue;
            let img = Jstick.RenderEngine.activeScene.Layers[layer].texture.getImageBitmap();
            Jstick.Viewport.Layers[layer].drawImage( img, x1, y1, x2, y2 );   
        }
    }

}


GAMELOOP = new throttledAnimation( (timestamp)=>{
    if(!Jstick.status) return;
    Jstick.Loop.nextTick(timestamp);
} , 30 );
