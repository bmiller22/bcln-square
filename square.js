/**
 * BCLearningNetwork.com
 * Perfect Squares
 * @author Colin Bernard and Brittany Miller
 * February 2018
 */

//// VARIABLES ////
var canvas = document.getElementById("gameCanvas");

var mute = false;
var FPS = 20;

var STAGE_WIDTH, STAGE_HEIGHT;

var gameStarted = false;

var GRID_SIZE = 40;
var CIRCLE_RADIUS = 9;
var black_circle;
var blue_circle;
var BLUE_CIRCLE_START = 50;
var BLUE_CIRCLE_INCREMENT = 2; // pixels per 1 number on numberline

var green_squares = [];

var square_text, square_root_text;

var counter = 1;

// Chrome 1+
var isChrome = !!window.chrome && !!window.chrome.webstore;



function init() {
 	STAGE_WIDTH = parseInt(document.getElementById("gameCanvas").getAttribute("width"));
	STAGE_HEIGHT = parseInt(document.getElementById("gameCanvas").getAttribute("height"));

	// init state object
	stage = new createjs.Stage("gameCanvas"); // canvas id is gameCanvas
	stage.mouseEventsEnabled = true;
	stage.enableMouseOver(); // Default, checks the mouse 20 times/second for hovering cursor changes

	setupManifest(); // preloadJS
	startPreload();

	stage.update();
}

function update(event) {
 	if (gameStarted) {

  }

	stage.update(event);
}

function endGame() {
 	gameStarted = false;
}

function initGraphics() {

  stage.addChild(header);

  grid.x = 40;
  grid.y = 140;
  stage.addChild(grid);

  numberline.y = STAGE_HEIGHT - numberline.image.height;
  stage.addChild(numberline);

  // graphics object
  var g = new createjs.Graphics();

  // black circle
  g = new createjs.Graphics();
  g.setStrokeStyle(1);
  g.beginStroke("black");
  g.beginFill("black");
  g.drawCircle(0, 0, CIRCLE_RADIUS);
  black_circle = new createjs.Shape(g);
  black_circle.x = grid.x + GRID_SIZE;
  black_circle.y = grid.y + GRID_SIZE;
  stage.addChild(black_circle);

  // green squares
  updateGreenSquares();

  // blue circle
  g = new createjs.Graphics();
  g.setStrokeStyle(1);
  g.beginStroke("blue");
  g.beginFill("blue");
  g.drawCircle(0, 0, CIRCLE_RADIUS);
  blue_circle = new createjs.Shape(g);
  blue_circle.x = BLUE_CIRCLE_START;
  blue_circle.y = 560;
  stage.addChild(blue_circle);

  // instructions text
  var instructions_text = new createjs.Text("Drag the black dot to adjust the value of the perfect squares. How does it affect the result?", "32px Lato", "black");
  instructions_text.lineWidth = 300;
  instructions_text.x = (STAGE_WIDTH/4) * 3 - instructions_text.lineWidth/2;
  instructions_text.y = grid.y;
  stage.addChild(instructions_text);

  // square text
  square_text = new createjs.Text(counter + " x " + counter + " = " + counter * counter, "40px Lato", "black");
  square_text.x = (STAGE_WIDTH/4) * 3 - square_text.getMeasuredWidth()/2;
  square_text.y = 350;
  stage.addChild(square_text);

  // square root text
  square_root_text = new createjs.Text(counter * counter + " = " + counter, "40px Lato", "black");
  square_root_text.x = (STAGE_WIDTH/4) * 3 - square_root_text.getMeasuredWidth()/2;
  square_root_text.y = 450;
  stage.addChild(square_root_text);

  if (isChrome) {
    rootsymbol.x = square_root_text.x - 30;
    rootsymbol.y = square_root_text.y - 15;
  } else { // working well on firefox
    rootsymbol.x = square_root_text.x - 30;
    rootsymbol.y = square_root_text.y - 20;
  }

  stage.addChild(rootsymbol);

	initListeners();
  initMuteUnMuteButtons();

  // start the game
	gameStarted = true;
	stage.update();
}

/*
 * Adds the mute and unmute buttons to the stage and defines listeners
 */
function initMuteUnMuteButtons() {
	var hitArea = new createjs.Shape();
	hitArea.graphics.beginFill("#000").drawRect(0, 0, muteButton.image.width, muteButton.image.height);
	muteButton.hitArea = unmuteButton.hitArea = hitArea;

	muteButton.x = unmuteButton.x = STAGE_WIDTH - muteButton.image.width - 5;
	muteButton.y = unmuteButton.y = 5;

	muteButton.cursor = "pointer";
	unmuteButton.cursor = "pointer";

	muteButton.on("click", toggleMute);
	unmuteButton.on("click", toggleMute);

	stage.addChild(unmuteButton);
}

function updateText() {
  square_text.text = counter + " x " + counter + " = " + counter * counter;
  square_text.x = (STAGE_WIDTH/4) * 3 - square_text.getMeasuredWidth()/2;

  square_root_text.text = counter * counter + " = " + counter;
  square_root_text.x = (STAGE_WIDTH/4) * 3 - square_root_text.getMeasuredWidth()/2;

  if (isChrome) {
    rootsymbol.x = square_root_text.x - 30;
    rootsymbol.y = square_root_text.y - 15;
  } else { // working well on firefox
    rootsymbol.x = square_root_text.x - 30;
    rootsymbol.y = square_root_text.y - 20;
  }
}

function updateGreenSquares() {

  for (var temp of green_squares) {
    stage.removeChild(temp);
  }

  for (var i = 0; i < counter; i++) {
    for (var j = 0; j < counter; j++) {
      var g = new createjs.Graphics();
      g.setStrokeStyle(1);
      g.beginStroke("black");
      g.beginFill("#94d8ac");
      g.drawRect(0, 0, GRID_SIZE, GRID_SIZE);
      var temp = new createjs.Shape(g);
      green_squares.push(temp);
      temp.x = grid.x + GRID_SIZE * i;
      temp.y = grid.y + GRID_SIZE * j;
      stage.addChildAt(temp, stage.getChildIndex(black_circle) - 1);
    }
  }
}




function initListeners() {

  black_circle.on("pressmove", function(event) {
    if (event.stageX >= black_circle.x + GRID_SIZE || event.stageY >= black_circle.y + GRID_SIZE) {

        if (black_circle.x + GRID_SIZE <= grid.x + grid.image.width) {
          black_circle.x += GRID_SIZE;
          black_circle.y += GRID_SIZE;

          counter++;
          updateGreenSquares();
          updateText();
          playSound("click");

          // floor(1position + number*number*(100position - 1position)/100)
          blue_circle.x = Math.floor(50 + counter * counter * ((795 - 50)/100))
        }


    } else if (event.stageX <= black_circle.x - GRID_SIZE || event.stageY <= black_circle.y - GRID_SIZE) {

        if (black_circle.x - GRID_SIZE >= grid.x + GRID_SIZE) {
          black_circle.x -= GRID_SIZE;
          black_circle.y -= GRID_SIZE;

          blue_circle.x -= BLUE_CIRCLE_INCREMENT * counter * counter;

          counter--;
          updateGreenSquares();
          updateText();
          playSound("click");
        }
    }
  });

  // for determining position to move blue circle
  // numberline.on("mousedown", function(event) {
  //   console.log("x: " + event.stageX);
  // });

}


//////////////////////// PRELOADJS FUNCTIONS

// bitmap variables
var grid, header, numberline, rootsymbol;
var muteButton, unmuteButton;


function setupManifest() {
 	manifest = [
    {
      src: "images/grid.png",
      id: "grid"
    },
    {
      src: "images/header.png",
      id: "header"
    },
    {
      src: "images/numberline.png",
      id: "numberline"
    },
    {
      src: "images/rootsymbol.png",
      id: "rootsymbol"
    },
    {
      src: "sounds/click.mp3",
      id: "click"
    },
    {
     src: "images/mute.png",
     id: "mute"
   },
   {
     src: "images/unmute.png",
     id: "unmute"
   }
 	];
}


function startPreload() {
	preload = new createjs.LoadQueue(true);
    preload.installPlugin(createjs.Sound);
    preload.on("fileload", handleFileLoad);
    preload.on("progress", handleFileProgress);
    preload.on("complete", loadComplete);
    preload.on("error", loadError);
    preload.loadManifest(manifest);
}

function handleFileLoad(event) {
	console.log("A file has loaded of type: " + event.item.type);
  // create bitmaps of images
  if (event.item.id == "grid") {
    grid = new createjs.Bitmap(event.result);
  } else if (event.item.id == "header") {
    header = new createjs.Bitmap(event.result);
  } else if (event.item.id == "numberline") {
    numberline = new createjs.Bitmap(event.result);
  } else if (event.item.id == "rootsymbol") {
    rootsymbol = new createjs.Bitmap(event.result);
  } else if (event.item.id == "mute") {
    muteButton = new createjs.Bitmap(event.result);
  } else if (event.item.id == "unmute") {
    unmuteButton = new createjs.Bitmap(event.result);
  }
}

function loadError(evt) {
    console.log("Error!",evt.text);
}

// not currently used as load time is short
function handleFileProgress(event) {

}

/*
 * Displays the start screen.
 */
function loadComplete(event) {
  console.log("Finished Loading Assets");

  // ticker calls update function, set the FPS
	createjs.Ticker.setFPS(FPS);
	createjs.Ticker.addEventListener("tick", update); // call update function

  stage.update();
  initGraphics();
}

///////////////////////////////////// END PRELOADJS FUNCTIONS
