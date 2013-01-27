var gameWidth = 480*2;
var gameHeight = 320*2;
var offsetTop = 200;
var maxScore = 0;

var track1 = 47.754;
var track2 = 49.1;
var track3 = 41;

var testing = false;

var showCover = true;
var retries = -1;

var totalTime = 0;

var checkpoint = -1;

var total = track1+track2+track3;

var soundEnabled = true;

var showBike = true;

if(soundEnabled){
  lowLag.init({
    sm2url: '/libraries/sm2/swf/',
    urlPrefix: '/media/',
    debug: 'none'
  });

}

lowLag.load(['EKG_winning.mp3','EKG_winning.ogg'],'win');
lowLag.load(['heart hospital_mixdown.mp3','heart hospital_mixdown.ogg'],'intro');


lowLag.load(['EKG_DEATH_AND_POWER_OFF.mp3','EKG_DEATH_AND_POWER_OFF.ogg'],'death');


lowLag.load(['LAND_FROM_JUMP_1.mp3','LAND_FROM_JUMP_1.ogg'],'land1');
lowLag.load(['LAND_FROM_JUMP_2.mp3','LAND_FROM_JUMP_2.ogg'],'land2');
lowLag.load(['LAND_FROM_JUMP_3.mp3','LAND_FROM_JUMP_3.ogg'],'land3');
lowLag.load(['LAND_FROM_JUMP_4.mp3','LAND_FROM_JUMP_4.ogg'],'land4');
lowLag.load(['LAND_FROM_JUMP_5.mp3','LAND_FROM_JUMP_5.ogg'],'land5');

landSounds = ['land1','land2','land3','land4','land5'];

//lowLag.load(['HEART_CONTRACT_FASTER.mp3','HEART_CONTRACT_FASTER.ogg'],'heartContractFaster');
//lowLag.load(['HEART_CONTRACT_FASTEST.mp3','HEART_CONTRACT_FASTST.ogg'],'heartContractFastest');
//lowLag.load(['HEART_CONTRACT.mp3','HEART_CONTRACT.ogg'],'heartContract');
//lowLag.load(['HEART_EXPAND_FASTER.mp3','HEART_EXPAND_FASTER.ogg'],'heartExpandFaster');
//lowLag.load(['HEART_EXPAND_FASTEST.mp3','HEART_EXPAND_FASTST.ogg'],'heartExpandFastest');
//lowLag.load(['HEART_EXPAND.mp3','HEART_EXPAND.ogg'],'heartExpand');

heartSounds = ['heartContractFaster','heartContract'];


randFromArray = function(array){
  return array[Math.floor(Math.random() * array.length)];
}

ig.module(
  'drop'
)
.requires(
  'impact.game',
  'impact.entity',
  'impact.collision-map',
  'impact.background-map',
  'impact.font',
  'plugins.perpixel'
)
.defines(function(){
  var gameOver = false;
//    var intro = new ig.Sound('/media/heart hospital_mixdown.*');
    var sound1 = new ig.Sound('/media/EKG_Final_1.*');
    var sound2 = new ig.Sound('/media/EKG_Final_2.*');
    var sound3 = new ig.Sound('/media/EKG_Final_3.*');


// The Backdrop image for the game, subclassed from ig.Image
// because it needs to be drawn in it's natural, unscaled size, 
FullsizeBackdrop = ig.Image.extend({
  resize: function(){},
  draw: function() {
    if( !this.loaded ) { return; }
    ig.system.context.drawImage( this.data, 0, 0 );
  }
});

Bike = ig.Entity.extend({
  id:"bike",
  size: {x:64, y:32},
  animSheet: new ig.AnimationSheet( '/media/t_chr_bikeA.png', 64, 32 ),
  type: ig.Entity.TYPE.NONE,
  collides: ig.Entity.COLLIDES.FIXED,
  init: function( x, y, settings ) {
    this.addAnim( 'idle', 0.1, [1] );
    this.parent( x, y, settings );
  }
});

BikeRunner = ig.Entity.extend({
  id:"bike",
  size: {x:32, y:32},
  animSheet: new ig.AnimationSheet( 'media/t_chr_bikeA.png', 32, 32 ),
  type: ig.Entity.TYPE.NONE,
  collides: ig.Entity.COLLIDES.FIXED,
  init: function( x, y, settings ) {
    this.addAnim( 'idle', 0.1, [0,1] );
    this.parent( x, y, settings );
  }
});


Pulse = ig.Entity.extend({
  id:"pulse",
  size: {x:16, y:16},
  animSheet: new ig.AnimationSheet( '/media/t_env_pulseA.png', 16, 16 ),
  type: ig.Entity.TYPE.NONE,
  collides: ig.Entity.COLLIDES.FIXED,
  timer: new ig.Timer(),
  init: function( x, y, settings ) {
    this.addAnim( 'idle', 0.1, [0,1] );
    this.parent( x, y, settings );
    this.timer.set(0);
  },
  update: function(){
    console.log(this.timer.delta());
  }
});




// The Bouncing Player Ball thing
EntityPlayer = ig.Entity.extend({
  id:"player",
  size: {x:40, y:64},
  checkAgainst: ig.Entity.TYPE.B,
  
  animSheet: new ig.AnimationSheet( 'media/t_chr_animA.png', 64, 64 ),
  collides: ig.Entity.COLLIDES.PASSIVE,
  
  maxVel: {x: 400, y: 900},
  friction: {x: 300, y:0},
  speed: 900,
  jump: 500,
  gravityFactor: 2,
  bounciness: 0.1,
  canJump: false,
  falling: 0,

  perPixel: false,

  init: function( x, y, settings ) {
    this.setType('young');
    this.parent( x, y, settings );
  },

  setType: function(type){
    this.type = type;

    var offset = 0;
    switch(type){
      case 'young':
        offset = 0;
        break;
      case 'middle':
        offset = 8*2;
        break;
      case 'old':
        offset = 8*4;
        break;
    }

    this.addAnim( 'idle', 0.1, [6+offset] );
    this.addAnim( 'run',  0.1, [0+offset,1+offset,2+offset,3+offset,4+offset,5+offset] );
    this.addAnim( 'fall', 0.1, [9+offset] );
    this.addAnim( 'land', 0.4, [7+offset,7+offset]);
    this.addAnim( 'jump', 0.1, [7+offset,8+offset], true );
    this.addAnim( 'death', 0.1, [10+offset,11+offset,12+offset,13+offset,14+offset,15+offset], true );

  },
  
  update: function() {
    if(gameOver){
      this.currentAnim = this.anims.death;
      if(!this.gameOver){
        this.currentAnim = this.anims.death.rewind();
        this.gameOver = true;
      }
      if(this.currentAnim.loopCount == 1){
        this.kill();
      }
      var position = this.pos;
      this.parent();
      this.pos = position;
    }else{
      // User Input
      if( ig.input.state('left') ) {
        this.accel.x = -this.speed;
        this.flip = true;
      }
      else if( ig.input.state('right') ) {
        this.accel.x = this.speed;
        this.flip = false;
      }
      else {
        this.accel.x = 0;
      }
      if( this.canJump && ig.input.state('jump') ) {
          if (this.vel.y == 0){
            this.vel.y = -this.jump;
            this.falling = 0;
            this.canJump = false;
            this.currentAnim = this.anims.jump.rewind();
          }
      }else
              // we're not standing, jump has been released and we're not falling
              // we reduce the y velocity by 66% and mark us as falling
              if(!this.standing && !ig.input.state('jump') && this.falling == 0) {
          this.vel.y = Math.floor(this.vel.y/3);
          this.falling = 1;
      }



      if( this.vel.y < 0 ) {
        this.currentAnim = this.anims.jump;
      }
      else if( this.vel.y > 20 ) {
        this.currentAnim = this.anims.fall;
        this.falling = 2;
      }
      else if( Math.abs(this.vel.x) > 40 ) {
        this.currentAnim = this.anims.run;
      }
      else {
        this.currentAnim = this.anims.idle;
      }

      if(this.falling > 0 && this.currentAnim != this.anims.fall){
        if(this.falling == 2){
          this.currentAnim = this.anims.land.rewind();
          lowLag.play(randFromArray(landSounds));

          this.falling = 3;

        }
        if(this.currentAnim.loopCount > 100){
          this.falling = 0;
        }
      }

      this.currentAnim.flip.x = this.flip;


      this.parent();
    }
  }
  
});


EntityFlatEKG = ig.Entity.extend({
  size: {x:64, y:256},
  maxVel: {x: 0, y: 0},
  type: ig.Entity.TYPE.A,
  collides: ig.Entity.COLLIDES.FIXED,
  animSheet: new ig.AnimationSheet( '/media/t_env_beatA.png', 64, 256 ),
  init: function( x, y, settings ) {
    this.addAnim( 'idle', 0.1, [0] );
    this.parent( x, y, settings );
  }
});

var beats = [];
var beatsLookup = ['B','C','D','E','F','G','H','I','J','K','L','M','N'];
for (var i=0;i<beatsLookup.length;i++){
  var beat = ig.Entity.extend({
   size: {x:256, y:256},
   maxVel: {x: 0, y: 0},
   type: ig.Entity.TYPE.A,
   collides: ig.Entity.COLLIDES.FIXED,
   animSheet: new ig.AnimationSheet( '/media/t_env_beat'+beatsLookup[i]+'.png', 256, 256 ),
   init: function( x, y, settings ) {
     this.addAnim( 'idle', 0.1, [0] );
     this.parent( x, y, settings );
   }
  });
  beats.push(beat)
}



ig.Entity.solveCollision = function( a, b ) {
  var player = b;
  var other = a;
  if(a.id == 'player'){
    player = a;
    other = b;
  }

  var floor = Math.ceil(player.pos.y);
  if(floor > offsetTop+50 && floor < offsetTop+80){
    player.standing = true;
    player.canJump = true;
  }
  if(player.standing){
    player.pos.y = offsetTop+64;
    if(player.vel.y > 0){
      player.vel.y = 0;
    }
  }else{
    player.pos.y = Math.ceil(player.last.y);
    if(player.vel.y > 0){
      player.vel.y = 0;
    }
  }

  if(player.touches(other)){
    //If we are still touching move them left again!
    var originalPosition = {
      x: player.pos.x+0,
      y: player.pos.y+0
    };
    var testing = true;
    var tolerance = 6;
    var counter = 0;

    if(Math.abs(player.pos.y)-offsetTop < 30){
      gameOver = true;
    }

    while(player.touches(other) && testing){
      counter++;
      //Move them straight up.
      if(counter < tolerance){
        player.pos.y--;
      //Move them straight left.
      }else if(counter < tolerance*2){
        if(counter == tolerance+1){
          player.pos.x = originalPosition.x+0;
          player.pos.y = originalPosition.y+0;
        }
        player.pos.x--;
      //Move them up and left.
      }else if(counter < tolerance*3){
        if(counter == tolerance*2+1){
          player.pos = originalPosition;
        }
        player.pos.x--;
        player.pos.y--;

      //Move them up and right. with a fairly low tolerance, we dont want to win the game for them
      }else if(counter < tolerance*4-tolerance/2){
        if(counter == tolerance+1){
          player.pos = originalPosition;
        }
        player.pos.y--;
      }else{
        testing = false;
        player.pos = player.last;
      }
    }

  }
};

// The actual Game Source
DropGame = ig.Game.extend({
  clearColor: null, // don't clear the screen
  gravity: 400,
  player: null,
    
  map: [],
  score: 0,
  speed: 250,

  hasSpawnedBike: false,

  heartbeat: {
    lastStart: 0,
    probability:.4
  },

  winlocation: false,

//  backdrop: new FullsizeBackdrop( '/media/backdrop.png' ),
  backdrop: new FullsizeBackdrop( '/media/backdrop1.jpg' ),
  font: new ig.Font( '/media/04b03.font.png' ),

  updateStatus: function(){
    var percent = (1 - (-this.totalGameTimer.delta() / this.gameTotalTime)) * 100;
    $('.progress .status').width(percent+'%');
    $('.progress img').css('left',percent+'%');
    $('.progress .display').html(Math.round(percent*10)/10+'%');
    if(percent > maxScore){
      maxScore = percent;
      $('.progress .maxScore').width(percent+'%');
    }
  },

  init: function() {
    if(retries == 0){
      totalTime = new ig.Timer();
      totalTime.set(0);
      $('.progress').show();
    }else if (retries > 0){
      totalTime.unpause();
    }
    $('.checkpoint1').css('left',((1-(track2+track3)/total)*100)+'%');
    $('.checkpoint2').css('left',((1-(track3)/total)*100)+'%');

    ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
    ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
    ig.input.bind(ig.KEY.UP_ARROW, 'jump');
    ig.input.bind(ig.KEY.SPACE, 'jump');
    ig.input.bind(ig.KEY.ENTER, 'ok');


//    ig.music.add( intro , 'intro');
    ig.music.add( sound1 , 'first');
    ig.music.add( sound2 , 'second' );
    ig.music.add( sound3, 'third' );
    ig.music.loop = true;



    $('.win').fadeOut('slow');
    $('.death').fadeOut('slow');

    if(!soundEnabled){
      ig.music.volume = 0;
    }
    this.gameTimer = new ig.Timer();
    this.gameLevel = checkpoint;

    this.gameTotalTime = track1+track2+track3;
    this.totalGameTimer = new ig.Timer();
    this.totalGameTimer.set(this.gameTotalTime);


    this.player = this.spawnEntity( EntityPlayer, ig.system.width/2-2, offsetTop );

    this.ekgs = [];
    while(this.getRenderedWidth() < gameWidth){
      this.ekgs.push(this.spawnEntity( EntityFlatEKG, this.getRenderedWidth(), offsetTop ));
    }

    if(this.gameLevel == -1){
      this.ekgs.push(this.spawnEntity( EntityFlatEKG, this.getRenderedWidth(), offsetTop ));
      this.ekgs.push(this.spawnEntity( EntityFlatEKG, this.getRenderedWidth(), offsetTop ));
      if(showBike){
        this.spawnEntity(Bike, this.getRenderedWidth(), offsetTop+50);
        this.spawnEntity(BikeRunner, this.getRenderedWidth()+70, offsetTop+30);
      }
      this.ekgs.push(this.spawnEntity( EntityFlatEKG, this.getRenderedWidth(), offsetTop ));
      this.ekgs.push(this.spawnEntity( EntityFlatEKG, this.getRenderedWidth(), offsetTop ));
      this.ekgs.push(this.spawnEntity( EntityFlatEKG, this.getRenderedWidth(), offsetTop ));
      this.ekgs.push(this.spawnEntity( EntityFlatEKG, this.getRenderedWidth(), offsetTop ));
      this.ekgs.push(this.spawnEntity( EntityFlatEKG, this.getRenderedWidth(), offsetTop ));
    }

  },

  getRenderedWidth: function(){
    var width = 0;
    for(var i=0;i<this.ekgs.length;i++){
      width += this.ekgs[i].size.x;
    }
    return width;
  },



  getHeartbeatTile: function(){
    var heartbeat = this.heartbeat;
    if  (this.screen.x - heartbeat.lastStart > 300 && Math.random()<heartbeat.probability){
      this.ekgs.push(this.spawnEntity( randFromArray(beats), this.getRenderedWidth(), offsetTop));
      heartbeat.lastStart = this.screen.x;
//      lowLag.play(randFromArray(heartSounds));
    }else{
      this.ekgs.push(this.spawnEntity( EntityFlatEKG, this.getRenderedWidth(), offsetTop ));
    }
  },
  
  
  update: function() {
    if( ig.input.pressed('ok') ) {
      showCover = false;
      gameOver = false;
      retries++;
      ig.music.stop();
      ig.system.setGame( DropGame );
    }
    if(showCover){
      $('.intro').show();
      return;
    }else{
      $('.intro').fadeOut('slow');
    }

    if(!this.winlocation){
      this.speed += ig.system.tick * (10/this.speed);
      if(!testing){
        this.screen.x += ig.system.tick * this.speed;
      }
    }
    if( this.gameOver ) {
      this.parent();
      return;
    }

    this.score += ig.system.tick * this.speed;

    // Do we need a new heartbeat?
    if(this.screen.x+gameWidth >  this.getRenderedWidth()){
      this.getHeartbeatTile();
    }
    this.parent();
    
    // check for gameover
    var pp = this.player.pos.x - this.screen.x;
    if( pp < -4 ) {
      gameOver = true;
    }else if (pp > gameWidth-this.player.size.x){
      this.player.vel.x = 0;
    }

    if(gameOver){
      ig.music.stop();
      this.gameOver = true;
      lowLag.play('death');
      $('.death').fadeIn(1000);
      $('.totalTime').html(Math.round(totalTime.delta())+' seconds');
      $('.retries').html(retries);
      totalTime.pause();
      this.ekgs.push(this.spawnEntity( EntityFlatEKG, this.getRenderedWidth(), offsetTop ));
      this.ekgs.push(this.spawnEntity( EntityFlatEKG, this.getRenderedWidth(), offsetTop ));
      this.ekgs.push(this.spawnEntity( EntityFlatEKG, this.getRenderedWidth(), offsetTop ));
      this.ekgs.push(this.spawnEntity( EntityFlatEKG, this.getRenderedWidth(), offsetTop ));
      this.ekgs.push(this.spawnEntity( EntityFlatEKG, this.getRenderedWidth(), offsetTop ));
      this.ekgs.push(this.spawnEntity( EntityFlatEKG, this.getRenderedWidth(), offsetTop ));
    }


    //Timer for player changes
    if(this.gameTimer.delta() > 0 || this.gameLevel == -1){
      this.gameLevel++;
      this.totalGameTimer = new ig.Timer();
      if(this.gameLevel == 0){
        this.gameTimer.set(track1);
        this.player.setType('young');
        this.speed = 250;
        this.heartbeat.probability = .4;
        ig.music.play('first');
        checkpoint = -1;
        this.totalGameTimer.set(this.gameTotalTime);
      }else if(this.gameLevel == 1){
        this.player.setType('middle');
        this.gameTimer.set(track2);
        this.speed = 260;
        this.heartbeat.probability = .6;
        ig.music.play('second');
        this.totalGameTimer.set(track2+track3);
        checkpoint = 0;
      }else if(this.gameLevel == 2){
        this.player.setType('old');
        this.gameTimer.set(track3);
        this.speed = 300;
        this.heartbeat.probability = .7;
        ig.music.play('third');
        this.totalGameTimer.set(track3);
        checkpoint = 1;
      }else{
        //WIN STATUS
        if(!this.winlocation){
          this.winlocation = this.screen.x+1;
          ig.music.stop();
          $('.win').fadeIn();
          $('.retries').html(retries);
          $('.totalTime').html(Math.round(totalTime.delta())+' seconds');
          totalTime.pause();
          this.totalGameTimer = new ig.Timer();
          this.totalGameTimer.set(0);
          this.updateStatus();
          lowLag.play('win');
        }
        this.screen.x -= ig.system.tick * this.speed*5;
      }
    }
    if(!this.winlocation){
      this.updateStatus();
    }

  },
  
  
  draw: function() {
    this.backdrop.draw();
    this.parent();
  }
});

ig.main('#canvas', DropGame, 30, gameWidth, gameHeight,1 );

});