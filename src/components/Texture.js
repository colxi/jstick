
async function _loadImage_(src){ 
    //if( typeof src !== 'string') throw new Error('First argument must be a filepath (string)');
    return new Promise( resolve =>{
        // create an image element
        let img = document.createElement('img');
        // allow crossorigin
        img.crossOrigin = "Anonymous";
        // set onload handler : when image is loaded resolve promise
        img.onload = async function(e){
            let image   = await createImageBitmap( img, 0 ,0 , img.width, img.height );
            img         = undefined;
            return resolve( image )
        }
        // set on error handler : if load fails throw an error
        img.onerror = ()=>{ throw new Error('Image not found at ' + src) };
        // done! Set the image source....
        img.src = src;
    });
};


const Texture = /* async */ function( filepath = '' ){
    // handle requests performed without using the keyword 'new'
    // otherwhise the Constructor will fail for the lack of own context (this)
    if( !this ) return new Texture( filepath );

    return new Promise( async resolve =>{
        let tmp_image;

        // WIDTH : holds the with of the image. 
        let WIDTH; 
        // HEIGHT: holds the height of the image. 
        let HEIGHT;
        // IMAGE_CANVAS : holds internally the reference to the canvas context that holds the image. 
        // The contained image is updated when image transformations are performed (flip, crop...), 
        // or texture.apply() is called. When texture.getBitmapImage is called the image is 
        // disattached from the canvas.
        let IMAGE_CANVAS;
        // IMAGE_DATA : holds internally the reference to the imageData of the canvas. When image transformations
        // are performed (crop, flip...) this Object is updated. When the user requests
        // the image arrayBuffer, modifies it and performs a texture.apply() call is
        // updated too
        let IMAGE_DATA;

        let IMAGE_BITMAP;

        // validate input
        if( !(filepath instanceof ImageBitmap) ){
            if( typeof filepath !== 'string' ) throw new Error('Argument 1 must be a filepath or an ImageBitmap');
            tmp_image = await _loadImage_( filepath );
        }else tmp_image = filepath;


        /**********************************************************************
         * 
         *  PUBLIC API
         * 
         **********************************************************************/

        /**
         * Texture.prototype.__type__ : Internal type flag
         */
        Object.defineProperty(this, '__type__', {
            value : 'Texture',
            enumerable: false,
            writable: false
        });

        /**
         * Texture.prototype.width : Returns the width of the texture
         */
        Object.defineProperty(this, 'width', {
            get: ()=> WIDTH,
            configurable: false
        });

        /**
         * Texture.prototype.height : Returns the height of the texture
         */
        Object.defineProperty(this, 'height', {
            get: ()=> HEIGHT,
            configurable: false
        });

        /**
         * Texture.prototype.crop : Crops the texture with the provided values. 
         */
        this.crop = ( x, y, w, h )=>{ 
            // validate input
            if( isNaN(x) || isNaN(y) || isNaN(w) || isNaN(h) ){ throw new Error('Arguments must be numbers')}
            // truncate numbers to garantee integers
            x <<= 0;
            y <<= 0;
            w <<= 0;
            h <<= 0;
            // extract the cropped image data
            IMAGE_DATA = IMAGE_CANVAS.getImageData(x, y, w , h);
            // assign new sizes
            WIDTH  = IMAGE_CANVAS.canvas.width  = w;
            HEIGHT = IMAGE_CANVAS.canvas.height = h;
            // update canvas content 
            this.apply();
            return true;
        };

        /**
         * Texture.prototype.flip : Flips the texture in the requested axi(s)
         */
        this.flip = (horizontal=true, vertical=false)=>{
            // validate input
            if (typeof horizontal !== "boolean" || typeof vertical !== "boolean" ){
                throw new Error('Only boolean values are accepted')
            }
            // apply flip transform
            IMAGE_CANVAS.setTransform(
                (horizontal ? -1 : 1), 0,       // set the direction of x axis
                0, (vertical ? -1 : 1),         // set the direction of y axis
                (horizontal ? WIDTH : 0),       // set the x origin
                (vertical ? HEIGHT : 0)         // set the y origin
            );
            // redraw image (flip will be applied)
            IMAGE_CANVAS.drawImage( IMAGE_CANVAS.canvas ,0, 0 );
            IMAGE_CANVAS.resetTransform(); // polyfill : IMAGE_CANVAS.setTransform(1, 0, 0, 1, 0, 0);
            // update IMAGEDATA object 
            IMAGE_DATA = IMAGE_CANVAS.getImageData(0, 0, WIDTH , HEIGHT );
            this.apply();
            return true;
        };

        /**
         * Texture.prototype.apply : Applies the changes performed in the buffer. A new buffer
         *                           can be provided to replace the whole imageData buffer. 
         */
        this.apply = ( data = IMAGE_DATA.data )=>{
            // validate input
            if( !(data instanceof Uint8ClampedArray) ) throw new Error('Only Uint8ClampedArray allowed');
            
            // if providing a reference of the active IMAGE_DATA, update canvas content
            if( data !== IMAGE_DATA.data ){
                // else create a new imageData object
                if(data.length !== IMAGE_DATA.data.length ) throw new Error('Invalid length in provided TypedArray');
                IMAGE_DATA.data.set( data );
            }
            IMAGE_CANVAS.putImageData( IMAGE_DATA, 0,0 );
            IMAGE_BITMAP = IMAGE_CANVAS.canvas.transferToImageBitmap();
            IMAGE_CANVAS.putImageData( IMAGE_DATA, 0,0 );
            return true;
        };
        
        /**
         * Texture.prototype.getImageBitmap : Returns an ImageBitmap of the texture. Usefull to
         *                                    perform fast canvas drawing.
         */
        this.getImageBitmap = function(){
            return IMAGE_BITMAP;
        };

        /**
         * Texture.prototype.getImageBuffer : Returns a reference to the image buffer typedArray.
         */
         this.getImageBuffer = function(){
            // return the reference 
            return IMAGE_DATA.data; 
        };

        /**
         * Texture.prototype.toBlob : (async) Returns an Blob representatoion of the texture.
         */
        this.toBlob = async function(){
            return await IMAGE_CANVAS.canvas.convertToBlob() ;
        };

        /**
         * Texture.prototype.toDataURL : (async) Returns an dataUrl representatoion of the texture.
         */
        this.toDataURL = async function(){
            let blob = await this.toBlob();
            return new Promise(resolve => {
                const reader = new FileReader();
                reader.addEventListener( 'load', ()=>resolve( reader.result ) );
                reader.readAsDataURL( blob );
            });
        };

        /**
         * Texture.prototype.getPixelIndex : Returns the index in the buffer of an array
         */ 
        this.getPixelIndex = function(x, y){
            // validate input
            if( isNaN(x) || isNaN(y) ) throw new Error('Expecting two integers');
            // truncate values
            x <<= 0;
            y <<= 0;
            return ( (y * WIDTH) + x ) * 4;
        };

        /**
         * Texture.prototype.getPixel : Returns the pixel data (RGBA) from provided coordinates
         */
        this.getPixel = function(x, y){
            let i = this.getPixelIndex(x, y);
            return [
                IMAGE_DATA.data[ i ],     // RED
                IMAGE_DATA.data[ i + 1 ], // GREEN
                IMAGE_DATA.data[ i + 2 ], // BLUE
                IMAGE_DATA.data[ i + 3 ]  // ALPHA
            ]
        };

        /**
         * Texture.prototype.setPixel : Sets the pixel data (RGBA) for provided coordinates
         */
        this.setPixel = function(x, y , color=[]){
            let i = this.getPixelIndex(x, y);
            IMAGE_DATA.data[i]   = color[0] || 0;    // RED
            IMAGE_DATA.data[i+1] = color[1] || 0;    // GREEN
            IMAGE_DATA.data[i+2] = color[2] || 0;    // BLUE
            IMAGE_DATA.data[i+3] = color[3] || 255;  // ALPHA
            return true;
        },

        /**
         * Texture.prototype.clearPixel : Clears the pixel data (RGBA) for provided coordinates
         */
        this.clearPixel = function(x, y ){
            let i = this.getPixelIndex(x, y);
            IMAGE_DATA.data[i] = 0;
            IMAGE_DATA.data[i+1] = 0;
            IMAGE_DATA.data[i+2] = 0;
            IMAGE_DATA.data[i+3] = 0;
        };

        /**
         * Texture.prototype.getPixelAlpha : Returns the pixel alpha channel data for provided coordinates
         */
        this.getPixelAlpha = function(x, y ){
            let i = this.getPixelIndex(x, y);
            return IMAGE_DATA.data[ i + 3 ];
        };

        /**
         * Texture.prototype.isPixelTransparent : Returns a boolean representing if the pixel for
         *                                        provided coordinates is transparent;
         */
        this.isPixelTransparent = function(x, y ){
            let i = this.getPixelIndex(x, y);
            return ( IMAGE_DATA.data[ i + 3 ] === 0) ? true : false;
        };

        /**
         * Texture.prototype.clone : (async) Returns a clone of the Texture 
         */
        this.clone =  async function(){
            let clone = await new Texture( this.getImageBitmap() );
            return clone;
        };

        /**
         * Texture.prototype.cloneFromArea : (async) Returns a clone of a sector of 
         *                                  the texture (resized)
         */
         this.cloneFromArea =  async function( x, y, w, h ){
            let clone = await new Texture( this.getImageBitmap() );
            clone.crop( x, y, w, h );
            return clone;
        };



        /*********************************************************************************
         * 
         * 
         *********************************************************************************/

        // Store image width and height
        WIDTH  = tmp_image.width;
        HEIGHT = tmp_image.height;
        
        // Obtained image will be stored in a canvas to allow its manipulation 
        IMAGE_CANVAS =  new OffscreenCanvas(WIDTH,HEIGHT).getContext('2d');
        IMAGE_CANVAS.drawImage( tmp_image, 0, 0);
        // obtain the imageData buffer of the initial image
        IMAGE_DATA  = IMAGE_CANVAS.getImageData(0, 0, WIDTH , HEIGHT );

        this.apply();

        // clear unnecessary variables and references
        filepath = undefined;
        tmp_image = undefined;
        
        return resolve( this );
    })
}

export {Texture};