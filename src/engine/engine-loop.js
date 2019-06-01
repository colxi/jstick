import {JStick} from '../jstick.js';
import {throttledAnimation } from '../lib/fps-throttle/src/fps-throttle.js';

let GAMELOOP;

JStick.Loop = {
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
        JStick.status = false;
        GAMELOOP.stop() 
    },
    
    resume(){ 
        GAMELOOP.start() 
        JStick.status = true;
    },

    nextTick( timestamp=performance.now() ){
        JStick.Viewport.updateZoom();
        JStick.Viewport.updateScroll();
        let input = JStick.Input.getStatus();
        JStick.Loop.update( timestamp, input );
        JStick.Loop.draw( timestamp, input );
        if( JStick.showInfo ) JStick.updateInfo();
        // reset some possible events like mousewheel
        JStick.Input.__update__();
    }

}


GAMELOOP = new throttledAnimation( (timestamp)=>{
    if(!JStick.status) return;
    JStick.Loop.nextTick(timestamp);
} , 30 );
