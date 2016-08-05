
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var led0 = new five.Led(11);
  var led1 = new five.Led(8);
  var led2 = new five.Led(9);
  var led3 = new five.Led(10);
  var button = new five.Button(2);

  var action = 'abort'; // or 'BOOM'
  var steps = [];

  led0.pulse();

  button.on("down", function() {
    led0.fadeOut();

    steps[1] = setTimeout( () => {
      led1.on();
    },1000);

    steps[2] = setTimeout( () => {
      led2.on();
    },2000);

    steps[3] = setTimeout( () => {
      led3.blink(50);
    },3000);

    steps[4] = setTimeout( () => {
      action = "BOOM";
      led1.off();
      led2.off();
      led3.stop().off();
    },4000);
  });

  button.on("up", () => {
    steps.forEach(t => clearTimeout(t));
    [led1,led2].forEach(led => led.off());
    led3.stop().off();
    led0.pulse();
    console.log(action);
    action = 'abort';
  });

});
