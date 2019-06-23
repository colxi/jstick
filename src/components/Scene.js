import {Camera}  from './Camera.js';


const Scene = function( width, height ){
    // handle requests performed without using the keyword 'new'
    // otherwhise the Constructor will fail for the lack of own context (this)
    if( !this ) return new Scene( width, height );

    this.Layers = {};

    this.width  = width;
    this.height = height;

    /**
     * this.addLayer : adds a layer
     *          scrollFactor : A value greater than 1 scrolls the element upward (element scrolls faster) when the user scrolls down the page.
     *                  A value less than 1 scrolls the element downward (element scrolls slower) when the user scrolls downward.
     *                  A value of 1 behaves normally.
     *                  A value of 0 effectively makes the element scroll fixed with the page.
     */
    this.addLayer = ( layerName , index , scrollFactor=1, zoomFactor=1 )=>{
        this.Layers[layerName] = {
            scrollFactor : scrollFactor,
            zoomFactor : zoomFactor,
            index   : index,
            name    : layerName,
            drawTexture : (texture,x,y,position='relative')=>{
                Jstick.RenderEngine.draw( texture, x, y, layerName, position );
            },
            drawSprite : (sprite,x,y,position='relative')=>{
                Jstick.RenderEngine.draw( sprite, x, y, layerName, position );
            },
            clear : ()=>{
                Jstick.RenderEngine.clear( layerName );
            }
        };
        return this.Layers[layerName];
    }


    this.Camera = new Camera( this );

    return this;
}


export {Scene};