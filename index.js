var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var spawn = require('child_process').spawn;
var five = require("johnny-five");
var board = new five.Board();

function armDevice (auth) {
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
      if (action === 'BOOM') {
        nukeInbox(auth);
        spawn('open', ['https://www.youtube.com/embed/75GJ8gYYCJg?feature=youtu.be&start=105&autoplay=1']);
      }
      action = 'abort';
    });

  });
}


// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/inbox0.json
var SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'inbox0.json';

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Gmail API.
  authorize(JSON.parse(content), armDevice);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.web.client_secret;
  var clientId = credentials.web.client_id;
  var redirectUrl = credentials.web.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });

  try {
    spawn('open', [authUrl]);
  } catch {
    console.log('Authorize this app by visiting this url: ', authUrl);
  }
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page url here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Archive the messages in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function nukeInbox(auth) {
  var gmail = google.gmail('v1');
  var messages = gmail.users.messages;

  messages.list({
    auth: auth,
    userId: 'me'
  }, (err, response) => {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    } else {
      if (response.messages.length == 0) {
        console.log('No messages found.');
      } else {
        for (var i = 0; i < response.messages.length; i++) {
          var message = response.messages[i];
          messages.trash({
            auth: auth,
            userId: 'me',
            id: message.id
          });
        }
      }
    }
  });
}
