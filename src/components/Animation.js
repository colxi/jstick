
/**
 * 
 * Animation Constructor :  Constructs an Animation Object from the provided definition
 *                          based in keypaths signatures and sprites, the 'loop' property
 *                          and the optional 'length' value.
 * 
 * Generates an Animation definition object. The second argument (length) can be ommited 
 * In that case the higest keyframe key value is used as length. 
 * 
 * Accepted parameter configurations :
 * -----------------------------------
 * function( keyframes<object> , loop<boolean>)
 * function( keyframes<object> , length<integer> , loop<boolean>)
 * 
 * 'Keyframes' object expected structure:
 * ------------------------------------
 * <object>{
 *      [0]  : <Sprite>,
 *      [10] : <Sprite>,
 *      [...]
 * }
 * 
 * Returned value
 * ---------------
 * Returns an <Animation> object
 * 
 */
const Animation = function( keyframes , length , loop){
    // handle requests performed without using the keyword 'new'
    // otherwhise the Constructor will fail for the lack of own context (this)
    if( !new.target ) return new Animation( ...arguments );

    
    if(typeof keyframes !== 'object') throw new Error('Argument 1 must be an object containing keyframes');
    
    // if the provided keyframes object is just an sprite...convert it into a keyframe definition
    if(keyframes.__type__ === 'Sprite') keyframes[0] = keyframes;
    
    // if any of the properties is not a number, is not a keyframes object
    let _last_keyframe = 0;
    for( let key in keyframes){
        if( !Number.isInteger( Number(key) ) ) throw new Error('The first argument (keyframes), must be an object with numerical properties')
        // if keyframe does not contain a sprite, throw an error
        if( typeof keyframes[key] !== 'object' || keyframes[key].__type__ !== 'Sprite') throw new Error('keyframe '+ key + ' does not contain a sprite');
        // if current keyframe is the bigger detected assign it to lastFrame
        if( Number(key) > _last_keyframe) _last_keyframe = Number(key);
    }
    if( !keyframes.hasOwnProperty('0') ) throw new Error('Keyframe "0" declaration is mandatory');

    // SCENARIO 1 : LENGTH IS LOOP. Boolena is found in the second argument and LOOP is undefined
    if( typeof length === 'boolean' ){
        if( typeof loop === 'undefined' ){
            loop = length;
            length = _last_keyframe;
        }else throw new Error ('When providing 3 arguments the Second argument "length" , must be an integer');
    }else if( !Number.isInteger(length)  ) throw new Error ('The Second argument "length" , must be an integer');

    // SCENARIO 2: LENGTH was an integer, validate Boolean in LOOP (defaults to TRUE)
    if( typeof loop === 'undefined' ) loop = true;
    else if( typeof loop !== 'boolean' ) throw new Error ('The third argument "loop" , must be a boolean');

    // VALIDATION COMPLETE! Builld the Animation Object
    this.__type__   = 'Animation'; 
    this.loop       = loop; 
    this.length     = length || _last_keyframe;
    this.keyframes  = keyframes;
}

export {Animation};