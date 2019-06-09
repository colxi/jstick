
const Scene = function( width, height ){
    // handle requests performed without using the keyword 'new'
    // otherwhise the Constructor will fail for the lack of own context (this)
    if( !this ) return new Scene( width, height );

    let LAYERS = {};

    this.width  = width;
    this.height = height;

    this.getLayers =()=>{ return LAYERS };

    this.addLayer = function( name, texture , index ){
        LAYERS[name] = texture;
    }

    return this;
}


export {Scene};