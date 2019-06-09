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
        if(Jstick.Viewport.view){
            Jstick.Viewport.view.updateZoom();
            Jstick.Viewport.view.updateScroll();
            Jstick.Viewport.view.updateFollow();
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
        if( !Jstick.Viewport.view ) return;
        let x1 = ( 0 - Jstick.Viewport.view.x );
        let y1 = ( 0 - Jstick.Viewport.view.y );
        let x2 = Jstick.Viewport.view.scene.width ;
        let y2 = Jstick.Viewport.view.scene.height;
        // Draw map data in canvas
        Jstick.Viewport.clear()

        let layer = Jstick.Viewport.view.scene.getLayers()['background'].getImageBitmap();
        Jstick.Viewport.Layers.map.drawImage( layer, x1, y1, x2, y2 );   
    }

}


GAMELOOP = new throttledAnimation( (timestamp)=>{
    if(!Jstick.status) return;
    Jstick.Loop.nextTick(timestamp);
} , 30 );
