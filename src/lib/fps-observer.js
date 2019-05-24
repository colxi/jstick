/**
 * Name : FPS Observer (fps-observer)
 * Author : colxi.info
 * Date: March 2019
 * Description : Configurable Engine to calculate FPS (frames per second), based 
 *               in requestAnimationFrame or in manual user calls. It allows to
 *               configure manually the size of the samples to take to calculate
 *               the FPS value.
 */

// number of samples to use to calculate the average FPS
let SAMPLE_SIZE          = 60;
// collection of samples with SAMPLE_SIZE length
let SAMPLES              = [];
// track the current sample index
let CURRENT_SAMPLE_INDEX = 0;
// timestamp for last cycle tick used to calculate time differece
let LAST_TICK_TIMESTAMP  = false;
// automatic mode Flag
let AUTO                 = true;
// key used to detect internal calls to FPS.tick()
let KEY = Symbol('INTERNAL_CALL');


// Automatic mode Cycle handler
function autoMeasure(){
    if( !AUTO ) return;
    FPS.tick(KEY);
    requestAnimationFrame( autoMeasure );
}


// Public API
const FPS = {
    // hold an updated value of the average FPS
    value : 0,

    // GET & SET the sample size
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
            SAMPLES = [];
            CURRENT_SAMPLE_INDEX = 0;
            LAST_TICK_TIMESTAMP = false;
        }
        return;
    },    

    // GET & SET AUTOMATIC MODE
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

    // HANDLE EACH LOOP CYCLE and calculate value for FPS
    tick : function(key){
        // warn if a manual call is performed when running automatic mode
        if(KEY !== key && AUTO) console.warn('Warning : FPS Observer is running in automatic mode in the background. If you want to perform manual calls to Fps.tick() disable first automatic mode (FPS.auto=false)');
        
        // if is first tick, just set tick timestamp and return
        if( !LAST_TICK_TIMESTAMP ){
            LAST_TICK_TIMESTAMP = performance.now();
            return 0;
        }
        // calculate necessary values to obtain current tick FPS
        let now   = performance.now();
        let delta = (now - LAST_TICK_TIMESTAMP)/1000;
        let fps   = 1/delta;
        // add to fps samples, current tick fps value 
        SAMPLES[ CURRENT_SAMPLE_INDEX ] = Math.round(fps);
        
        // iterate samples to obtain the average
        let average = 0;
        for(let i=0; i<SAMPLES.length; i++) average += SAMPLES[ i ];

        average = Math.round( average / SAMPLES.length);

        // set new FPS
        this.value = average;
        // store current timestamp
        LAST_TICK_TIMESTAMP = now;
        // increase sample index counter, and reset it
        // to 0 if exceded maximum sampleSize limit
        CURRENT_SAMPLE_INDEX++;
        if( CURRENT_SAMPLE_INDEX === SAMPLE_SIZE ) CURRENT_SAMPLE_INDEX = 0;
        return this.value;
    }
}

// init
autoMeasure();

export {FPS};