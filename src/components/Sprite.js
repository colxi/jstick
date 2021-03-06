import {Texture}  from './Texture.js';


/**
 * 
 * Sprite Constructor : (async) Builds a Sprite Object, from the provided imageBitmap
 *                      or filepath string. If croping coordinates are provided, the
 *                      Sprite will be cropped from the source image. In the proces
 *                      of building, some preprocessing is done and cached (X/Y image flip)
 *                      
 * 
 * 
 */
const Sprite = /* async */ function( image = '', x=0, y=0, w, h ){
    // handle requests performed without using the keyword 'new'
    // otherwhise the Constructor will fail for the lack of own context (this)
    if( !new.target ) return new Sprite( ...arguments );
    
    return new Promise( async resolve =>{
        // input validation
        if( !(image instanceof Texture) ){
            throw new Error('Argument 1 must be  a Texture or a filepath');
        };

        // if source is a path, load the image
        if( typeof image === 'string' ) image = await new Texture( image );
        // if cropping values are not set, use the whole image size
        w = w || image.width;
        h = h || image.height;
        // crop the image
        let spriteImage = await image.cloneFromArea( x, y, w, h );

        // build the Sprite object
        this.__type__ = 'Sprite';
        this.texture = spriteImage;

        this.cache   = {
            flipX  : await spriteImage.clone(),
            flipY  : await spriteImage.clone(),
            flipXY : await spriteImage.clone()
        }
        this.cache.flipX.flip(true, false);
        this.cache.flipY.flip(false, true);
        this.cache.flipXY.flip(true, true);

      
        /*
        // TODO !!! ¿ Sprite padding : add blank space?
        this.padding = {
            x : 0,
            y : 0
        }
        or better Axis, pivot, and XY offsets.. to be able to keep aligned the sprite 
        in Animations where each sprite has a different size...or the stand/crop probem
        when main coordinates are in the top-left corner of the sprite
        */

        // done!
        return resolve(this);
    })
}

export {Sprite};