

const Scene = function( _instance_, width, height ){
    // handle requests performed without using the keyword 'new'
    // otherwhise the Constructor will fail for the lack of own context (this)
    if( !this ) return new Scene( _instance_, width, height );

    this.Layers = {};

    this.width  = width;
    this.height = height;

    this.removeLayer = ( layerName )=>{};
    this.reorderLayer = ( layerName, newOrder )=>{};
    this.renameLayer = ( layerName, newName )=>{};
    
    this.addLayer = ( layerName , index , scrollFactor=1, zoomFactor=1 )=>{
        this.Layers[layerName] = {
            scrollFactor : scrollFactor,
            zoomFactor : zoomFactor,
            index   : index,
            name    : layerName,
            drawTexture : (texture,x,y)=>{
                _instance_.Renderer.draw( texture, x, y, layerName );
            },
            drawSprite : (sprite,x, y, flipX=false, flipY=false)=>{
                _instance_.Renderer.draw( sprite, x, y, layerName, flipX, flipY );
            },
            clear : ()=>{
                _instance_.Renderer.clear( layerName );
            }
        };
        _instance_.Renderer.updateLayout()
        return this.Layers[layerName];
    }

    return this;
}


export {Scene};