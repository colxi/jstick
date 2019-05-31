/**
 * Name : FPS Observer (fps-observer)
 * Author : colxi.info
 * Date: March 2019
 * Description : Configurable helper to observe the FPS (frames per second), based 
 *               in requestAnimationFrame or in manual user calls. It allows to
 *               configure the ammount of samples to collect to calculate
 *               the averaged FPS value.
 */

window.fpsObserver = function fpsObserver(autoObserve){
    'use strict';

    if( !new.target ) return new fpsObserver(autoObserve);
    
    // default autoObserveValue and validation
    if( typeof autoObserve === 'undefined' ) autoObserve = true;
    else if( typeof autoObserve !== 'boolean') throw new Error('First argument must be a boolean');
    
    // observer status
    let ENABLED = true;
    // number of samples to use to calculate the average FPS
    let SAMPLE_SIZE          = 60;
    // collection of samples with SAMPLE_SIZE length
    let SAMPLES              = [];
    // track the current sample index
    let CURRENT_SAMPLE_INDEX = 0;
    // timestamp for last cycle tick used to calculate time differece
    let LAST_TICK_TIMESTAMP  = false;
    // automatic mode Flag
    let AUTO                 = autoObserve;
    
    // key used to detect internal calls to FPS.tick()
    let KEY = Symbol('INTERNAL_CALL');


    // Automatic mode Cycle handler
    function autoMeasure(){
        if( !ENABLED || !AUTO ) return;
        FPS.tick(KEY);
        requestAnimationFrame( autoMeasure );
    }


    // Public API
    const FPS = {
        /*
         * <fpsObserver>.active : return the status of the observer
         */
        get active(){ return ENABLED },

        /**
         * <fpsObserver>.value : hold an updated value of the average FPS.
         */
        value : 0,

        /**
         * <fpsObserver>.sampleSize : Positive Integer value.
         */ 
        get sampleSize(){ return SAMPLE_SIZE },
        set sampleSize(value){
            // cast it to a Number (if is a numerical string, otherwise NaN returned)
            value = Number(value);
            if( !Number.isInteger(value) || value < 1){
                throw new Error('FPS.sampleSize[SET] : Invalid value provided. Only Integer Numbers greater than 0 are allowed.');
            }
            // if new value is different than current value
            if(value !== SAMPLE_SIZE){
                // assign new value
                SAMPLE_SIZE = value;
                // reset engine & clear previous samples
                FPS.reset();
            }
            return;
        },    

        /**
         *  <fpsObserver>.auto : Enable/disable FPS automatic observation.
         *                       If set to true, a continous sequence of 
         *                       requestAnimationFrame is going to be
         *                       executed in the background.
         */
        get auto(){
            return AUTO;
        },
        set auto(value){
            // normalize to Boolean value
            value =  Boolean(value);
            // if new value is different than current value
            if( value !== AUTO){
                // assign new value
                AUTO = value;
                // reset engine & clear previous samples
                SAMPLES = [];
                CURRENT_SAMPLE_INDEX = 0;
                LAST_TICK_TIMESTAMP = false;
                // if automatic mode is requested, start engine
                if( AUTO ) autoMeasure();
            }
            return;
        },

        /**
         * <fpsObserver>.tick() : Method to be executed in each animation frame. This
         *                        method collects the cycle times, and performs the 
         *                        calculus to obtain the fps value. When fpsObserver is
         *                        set to run manually ( <fpsObserver>.auto=false ) , this
         *                        method needs to be called manually.
         * 
         */
        tick : function(key){
            // block if disabled
            if(!ENABLED) return false;

            // warn if a manual call is performed when running automatic mode
            if(KEY !== key && AUTO) console.warn('Warning : FPS Observer is running in automatic mode in the background. If you want to perform manual calls to Fps.tick() disable first automatic mode (FPS.auto=false)');
            
            // if is first tick, just set tick timestamp and return
            if( !LAST_TICK_TIMESTAMP ){
                LAST_TICK_TIMESTAMP = performance.now();
                return 0;
            }
            // calculate necessary values to obtain current tick FPS
            let now   = performance.now();
            let delta = (now - LAST_TICK_TIMESTAMP);
            let fps   = 1000/delta;
            // add to fps samples, current tick fps value 
            SAMPLES[ CURRENT_SAMPLE_INDEX ] = fps;
            
            // iterate samples to obtain the average
            let average = 0;
            let length = SAMPLES.length;
            for(let i=0; i<length; i++){
                average += SAMPLES[ i ];
            }
            average = ( average / length ) << 0;

            // set new FPS
            this.value = ( length < SAMPLE_SIZE ) ? SAMPLES[ CURRENT_SAMPLE_INDEX ] << 0 : average;
            // store current timestamp
            LAST_TICK_TIMESTAMP = now;
            // increase sample index counter, and reset it
            // to 0 if exceded maximum sampleSize limit
            CURRENT_SAMPLE_INDEX++;
            if( CURRENT_SAMPLE_INDEX === SAMPLE_SIZE ) CURRENT_SAMPLE_INDEX = 0;
            return this.value;
        },
        
        /**
         * <fpsObserver>.reset() : Reset the collection of collected data. Useful when the
         *                         Animation loop is paused, and resumed again.
         */
        reset: function(){
            // reset engine & clear previous samples
            SAMPLES = [];
            CURRENT_SAMPLE_INDEX = 0;
            LAST_TICK_TIMESTAMP = false;
            return true;
        },

        disconnect : function(){
            FPS.reset();
            ENABLED = false;
        }
    };

    // initiate in automatic mode by default
    requestAnimationFrame( autoMeasure );
    
    // done!
    // return the API
    return FPS;
}

