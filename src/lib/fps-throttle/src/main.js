import {fpsObserver} from '../node_modules/fps-observer/src/fps-observer.js';

window.throttledAnimation = function throttledAnimation(callback, targetFPS){
    'use strict';

    if( !new.target ) return new throttledAnimation(callback, targetFPS);
    // validate input & default values
    if(typeof targetFPS=== 'undefined') targetFPS=30;
    if(typeof callback !== 'function' || !Number.isInteger(targetFPS) ) throw new Error('First argument must be a function.');
    if(typeof targetFPS !== 'number' || !Number.isInteger(targetFPS) ) throw new Error('Second argument must be an interger.');
    if(targetFPS < 1)  throw new Error('Second argument must be greater than 0');

    // create a new Framerate observer
    let FPS =  new fpsObserver();
    // disable automatic observing
    FPS.auto = false;

    // interval flags and variables
    let RUNNING                 = false;
    let THROTTLE                = targetFPS;
    let FPS_OBSERVE             = true;
    let CYCLE_INTERVAL          = 1000 / THROTTLE;
    let LAST_CYCLE_TIMESTRAMP   = 0;

    // cycle tick function
    function tick(timestamp) {
        // abort if animation has been stopped
        if(!RUNNING) return;
        // request new frame
        requestAnimationFrame(tick);
        // calculate elapsed time
        let elapsed = timestamp - LAST_CYCLE_TIMESTRAMP;
        // if elapsed time is greater than throttled fps interval...
        if(elapsed > CYCLE_INTERVAL){
            // calculate averaged effective FPS
            if( FPS_OBSERVE ) FPS.tick();
            // Get ready for next frame by setting LAST_CYCLE_TIMESTRAMP=timestamp, but
            // also, adjust for CYCLE_INTERVAL not being multiple of 16.67
            LAST_CYCLE_TIMESTRAMP = timestamp - (elapsed % CYCLE_INTERVAL);
            // execute the provided animation callback
            callback( timestamp );
        }
    }

    // public METHODS
    let Animation = {
        get throttle(){ return THROTTLE} ,
        set throttle(fps){
            // sanitize input value
            if( Number( fps ) == fps ) fps = Number(fps);
            if(typeof fps !== 'number' || !Number.isInteger(fps) ) throw new Error('Only interger numbers allowed');
            if(fps < 1)  throw new Error('Value must be greater than 0');
            // assign new value
            THROTTLE = fps;
            CYCLE_INTERVAL = 1000 / THROTTLE;
            FPS.reset();
            return true;
        },

        set fps(val){ return false },
        get fps(){
            if(FPS_OBSERVE) return FPS.value; 
            else return -1;
        },

        get fpsSampleSize(){ return FPS.sampleSize }, 
        set fpsSampleSize(val){ return FPS.sampleSize = val },

        get fpsObserve(){ return FPS_OBSERVE }, 
        set fpsObserve(val){ 
            if(typeof val !== 'boolean') throw new Error('Expecting a boolean value');
            FPS_OBSERVE = val;
            return true;
        },

        start : function(){
            // block if already running;
            if( RUNNING ) return false;
            RUNNING= true;
            requestAnimationFrame( tick );
            return true;
        },

        stop : function(){
            RUNNING = false;
            Animation.fps = 0;
            FPS.reset();
            return true;
        }
    }
    // autostart
    Animation.start();

    return Animation;
}

