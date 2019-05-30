import {JStick} from '../jstick.js';

let BOUNDING_BOXES = false;

JStick.Sprite = {

    draw(image , x=0,y=0,  flipX=false, flipY=false){ 
        // Handle Sprite object reference, and extract the actual image data from it
        if( typeof image === 'object' && image.__type__ === 'Sprite'){
            // Perform a XOR operation betwen flip and the Sprite object 
            // Flip property status. If both flips are set to true, 
            // flip is cancelled.
            flipX = flipX ^ image.flip.x;
            flipY = flipY ^ image.flip.y;
            // retrieve the image from the Sprite
            image = image.image;
        }

        // if any sort of image flip is requested, look for it in the cache. If flipped sprite
        // is not cached, (async) cache inclusion is performed, and this draw request is skipped
        // because the flipped image is not yet available   
        if(flipX && flipY ){
            let preprocessed = JStick.Cache.retrieve( image, JStick.Cache.ADD_MISSING );
            if( !preprocessed ) return false;
            image = preprocessed.flipXY;
        }
        else if(flipX){
            let preprocessed = JStick.Cache.retrieve( image, JStick.Cache.ADD_MISSING );
            if( !preprocessed ) return false;
            image = preprocessed.flipX;
        }
        else if(flipY){
            let preprocessed = JStick.Cache.retrieve( image, JStick.Cache.ADD_MISSING );
            if( !preprocessed ) return false;
            image = preprocessed.flipY;
        }

        // draw the imageBitmap in the requested coordinates, considering
        // Viewport scroll 
        JStick.Viewport.Layers.sprites.drawImage( 
            image , 
            ( x - JStick.Viewport.scrollX ), 
            ( y - JStick.Viewport.scrollY ), 
            image.width, 
            image.height
        );

        let lemCenter = {
            x : x + image.width  - 3 - JStick.Viewport.scrollX,
            y : y + image.height - 1 - JStick.Viewport.scrollY,
        }
        if( BOUNDING_BOXES ){
            JStick.Viewport.Layers.sprites.strokeStyle = "#FF0000";
            JStick.Viewport.Layers.sprites.strokeRect(x- JStick.Viewport.scrollX, y- JStick.Viewport.scrollY,image.width,image.height);
        }
        
        // draw axis
        JStick.Viewport.Layers.sprites.fillStyle = "#00FFFF";
        JStick.Viewport.Layers.sprites.fillRect(lemCenter.x, lemCenter.y,1,5);

        // draw ground coord
        JStick.Viewport.Layers.sprites.fillStyle = "#FF0000";
        JStick.Viewport.Layers.sprites.fillRect(lemCenter.x, lemCenter.y,1,1);
    },

    set drawBoundingBoxes( val ){
        if( typeof val !== 'boolean' ) throw new Error('Value must be a boolean'); 
        BOUNDING_BOXES = val;
        return true;
    },
    get drawBoundingBoxes(){ return BOUNDING_BOXES },

    flip(){}, //flips the reference, updates cache, removes from cache previous sprite
    
    scale(){} //scale the reference, updates cache, removes from cache previous sprite
};
