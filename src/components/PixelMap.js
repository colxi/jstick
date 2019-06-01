import {Jstick} from '../jstick.js';


const PixelMap = /* async */ function( image = '' ){
    // handle requests performed without using the keyword 'new'
    // otherwhise the Constructor will fail for the lack of own context (this)
    if( !this ) return new PixelMap(image );
    
    return new Promise( async resolve =>{
        // input validation
        if( !(image instanceof ImageBitmap) && (typeof image !== 'string') ){
            throw new Error('Argument 1 must be a filepath or an ImageBitmap');
        };

        // if source is a path, load the image
        if( typeof image === 'string' ) image = await Jstick.Image.load( image );

        
        // convert the bitmap image into a ImageData object (with its internal BufferArray)
        // for easy and fast directo pixel level manipulation
        let imageData = Jstick.Image.imageBitmapToImageData( image );
        // When the imageData buffer is ready to be printed, it needs to be converted to a
        // ImageBitmap in order to be used by Jstick.Viewport.Layers.map.drawImage. To perform 
        // this conversion the following  offscreen canvas will be used
        let transferCanvas =  new OffscreenCanvas(image.width,image.height).getContext('2d');
        
        // build the Map object
        this.__type__ = 'Map';
        this.width  = imageData.width;
        this.height = imageData.height;
        this.buffer = imageData.data;
        this.Cursor = {
            x : 0,
            y : 0
        };

        this.draw = function(){
            // imageData is dumped efficently in the offscreen canvas with putImageData...
            transferCanvas.putImageData(imageData, 0,0);
            // ...once imageData is in the offscreen canvas, the data is desatached from it
            // using transferToImageBitmap() (instead of performing a regular byte level
            // copy/duplicate of the data
            let imageBitmap = transferCanvas.canvas.transferToImageBitmap();
            // The ImageBitmap interface represents a bitmap image which can be drawn to 
            // a <canvas> without undue latency 
            Jstick.Map.draw( imageBitmap );
        }
        
       return resolve( this);
    })

};



/**
 * 
 * _getPixelIndex() : Returns the index in the Image data Buffer for the requested
 *                   [x,y] coordinates. Index is used to direct acces to ArrayBuffer
 * 
 */
PixelMap.prototype.getPixelIndex = function(x, y){
    x <<= 0;
    y <<= 0;
    return ( (y * this.width) + x ) * 4;
};


PixelMap.prototype.getPixel = function(x, y){
    x <<= 0;
    y <<= 0;

    let i = this.getPixelIndex(x, y);
    return [
        this.buffer[ i ],     // RED
        this.buffer[ i + 1 ], // GREEN
        this.buffer[ i + 2 ], // BLUE
        this.buffer[ i + 3 ]  // ALPHA
    ]
};


PixelMap.prototype.setPixel = function(x, y , color=[]){
    x <<= 0;
    y <<= 0;

    let i = this.getPixelIndex(x, y);
    this.buffer[i]   = color[0] || 0;    // RED
    this.buffer[i+1] = color[1] || 0;    // GREEN
    this.buffer[i+2] = color[2] || 0;    // BLUE
    this.buffer[i+3] = color[3] || 255;  // ALPHA
    return true;
},


PixelMap.prototype.clearPixel = function(x, y ){
    x <<= 0;
    y <<= 0;

    let i = this.getPixelIndex(x, y);
    this.buffer[i] = 0;
    this.buffer[i+1] = 0;
    this.buffer[i+2] = 0;
    this.buffer[i+3] = 0;
};

PixelMap.prototype.getPixelAlpha = function(x, y ){
    x <<= 0;
    y <<= 0;

    let i = this.getPixelIndex(x, y);
    return this.buffer[ i + 3 ];
};


PixelMap.prototype.isPixelTransparent = function(x, y ){
    x <<= 0;
    y <<= 0;

    let i = this.getPixelIndex(x, y);
    return ( this.buffer[ i + 3 ] === 0) ? true : false;
};


export {PixelMap}
