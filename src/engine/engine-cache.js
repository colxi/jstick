import {JStick} from '../jstick.js';



const SPRITES_CACHE = new WeakMap();
const MAX_SPRITE_SIZE = 320;


JStick.Cache = {
    ADD_MISSING : true,

    expose(){
        console.log(SPRITES_CACHE);
    },

    retrieve( image ){ 
        let cached = SPRITES_CACHE.get(image);
        if(!cached) return false;
        return cached;
    },

    async sprite( image ){
        if( image.width > MAX_SPRITE_SIZE || image.height > MAX_SPRITE_SIZE ) return false;
        
        SPRITES_CACHE.set( image, {
            regular : image,
            flipX   : await JStick.Image.flip(image, true, false),
            flipY   : await JStick.Image.flip(image, false, true),
            flipXY  : await JStick.Image.flip(image, true, true)
        } );
    }
}