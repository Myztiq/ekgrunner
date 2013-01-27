/*
 * ImpactJS Per-Pixel Collision Detection Plugin
 * Written by Abraham Walters
 * v1.0 - January 2012
 * v1.1 - August 2012
 *
 */
ig.module(
  'plugins.perpixel'
)
.requires(
  'impact.impact',
  'impact.image',
  'impact.entity'
)
.defines(function () {

    ig.Image.inject({

        alphas: [],
        alphasLoaded: false,

        loadAlphas: function(){
            var canvas = ig.$new( 'canvas' );
            canvas.width = this.data.width;
            canvas.height = this.data.height;
            var ctx = canvas.getContext( '2d' );

            ctx.drawImage( this.data, 0, 0 );
            var pixels = ctx.getImageData( 0, 0, this.data.width, this.data.height ).data,
                aIndex = 0,
                width = this.data.width * 4,
                height = this.data.height * width;

            for( var y = 3; y < height; y += width ){
                for( var x = 0; x < width; x += 4 ){
                    this.alphas[aIndex++] = pixels[x + y] ? true : false;
                }
            }
            this.alphasLoaded = true;
        },

        onload: function( event ){

          if ( !this.alphasLoaded ){
            if(this.path == "media/t_chr_animA.png"){
              this.alphas = [];
              for(var i=0;i<512*512;i++){
                this.alphas[i]= true;
              }
            }else{
              this.loadAlphas();
            }
          }
          this.parent( event );
        }

    });

    ig.Entity.inject({

        touches: function( other ){
            //if in weltmeister or no associated animation sheet for either entity
            //call parent method and ignore per-pixel
            if( ig.global.wm || this.currentAnim === null || other.currentAnim === null ){
                return this.parent( other );
            }

            //start with initial overlapping bounding box test
            //this section mimics the parent method,
            //but initializes some vars needed later on in the algorithm
            var xA = this.pos.x.round(),
                yA = this.pos.y.round(),
                xB = other.pos.x.round(),
                yB = other.pos.y.round(),
                xMin = Math.max( xA, xB ),
                xMax = Math.min( xA + this.size.x, xB + other.size.x ),
                yMin = Math.max( yA, yB ),
                yMax = Math.min( yA + this.size.y, yB + other.size.y );

            if( xMin >= xMax || yMin >= yMax ) {
              return false;
            }


            //start per-pixel
            //calculate all necessary variables
            var a = this.currentAnim.sheet.image.alphas,
                b = other.currentAnim.sheet.image.alphas,
                i = yMax - yMin,
                tileA = this.currentAnim.tile,
                widthA = this.currentAnim.sheet.width,
                heightA = this.currentAnim.sheet.height,
                imageWidthA = this.currentAnim.sheet.image.width,
                offsetAx = ~~(tileA * widthA) % imageWidthA,
                offsetAy = ~~(tileA * widthA / imageWidthA) * heightA,
                tileB = other.currentAnim.tile,
                widthB = other.currentAnim.sheet.width,
                heightB = other.currentAnim.sheet.height,
                imageWidthB = other.currentAnim.sheet.image.width,
                offsetBx = ~~(tileB * widthB) % imageWidthB,
                offsetBy = ~~(tileB * widthB / imageWidthB) * heightB,
                y1 = (yMin - yA + offsetAy) * imageWidthA,
                y2 = (yMin - yB + offsetBy) * imageWidthB,
                aStart = xMin - xA + offsetAx,
                bStart = xMin - xB + offsetBx,
                xDiff = xMax - xMin;

            //loop through both entities' .alpha arrays
            //if an alpha value > 0 is found to occupy
            //the same pixel for both entities, a collision occurs
            while( i-- ) {
                var j = xDiff,
                    x1 = aStart,
                    x2 = bStart;
                while( j-- ) {
                    if ( a[y1 + x1++] && b[y2 + x2] ) {
                      return true;
                    }
                    x2++;
                }
                y1 += imageWidthA;
                y2 += imageWidthB;
            }
            return false;
        }

    });
});


