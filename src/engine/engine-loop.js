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
        Jstick.Camera.updateZoom();
        Jstick.Camera.updateScroll();
        Jstick.Camera.updateFollow();
        let input = Jstick.Input.getStatus();
        Jstick.Loop.update( timestamp, input );
        Jstick.Loop.draw( timestamp, input );
        if( Jstick.showInfo ) Jstick.updateInfo();
        // reset some possible events like mousewheel
        Jstick.Input.__update__();
    }

}


GAMELOOP = new throttledAnimation( (timestamp)=>{
    if(!Jstick.status) return;
    Jstick.Loop.nextTick(timestamp);
} , 30 );
