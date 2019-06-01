import {Jstick} from '../jstick.js';


Jstick.Image = {
    async load(src){ 
        if( typeof src !== 'string') throw new Error('First argument must be a filepath (string)');
        return new Promise( resolve =>{
            // create an image element
            let img = document.createElement('img');
            // set onload handler : when image is loaded resolve promise
            img.onload = async function(e){
                let image = await createImageBitmap( img, 0 ,0 , img.width, img.height );
                resolve( image )
            }
            // set on error handler : if load fails throw an error
            img.onerror = ()=>{ throw new Error('Image not found at ' + src) };
            // done! Set the image source....
            img.src = src;
        });
    },

    async crop( image, x, y, w, h){ 
        let croppedImage = await createImageBitmap( image ,x ,y ,w ,h );
        return croppedImage;
    },

    async flip(image, horizontal=true, vertical=false){

        let ctx = document.createElement('canvas').getContext('2d');
        ctx.canvas.width= image.width;
        ctx.canvas.height= image.height;

        ctx.setTransform(
            (horizontal ? -1 : 1), 0,        // set the direction of x axis
            0, (vertical ? -1 : 1),          // set the direction of y axis
            (horizontal ? image.width : 0),  // set the x origin
            (vertical ? image.height : 0)    // set the y origin
        );
        ctx.drawImage(image,0,0);

        let flipped = await createImageBitmap( ctx.canvas ,0 ,0 ,image.width ,image.height );
        return flipped;
    },

    imageBitmapToImageData( imageBitmap ){
        transferContext.canvas.width = imageBitmap.width;
        transferContext.canvas.height = imageBitmap.height;
        transferContext.drawImage( imageBitmap, 0, 0);
        return transferContext.getImageData(0, 0, imageBitmap.width , imageBitmap.height);
    },

    imageDataToImageBitmap( imageData){

    }

    
 
}

let transferContext  = new OffscreenCanvas(1,1).getContext('2d');


