# Email Archive Button 
aka The Nuclear Option 

aka Inbox Zero as a Service

Arduino button for instant inbox0 with gmail. Button archives all email in a connected gmail inbox.
Requires nodeJS

## Step 1:
Build the button with an Arduino. You'll need a button, 4 leds, and wires/resistor.
Plug in the Arduino in to the host nodejs environment.

## Step 2: 
`npm install`
`npm start`
Your first time running you'll be asked to authenticate a gmail account

**Warning:** Once you authenticate a gmail account, the device will become armed.

## Step 3: 
Wait until email inbox aggression has left you will no other option. 
- A pulsing LED indicate the device is armed
- Press and hold the button.
- wait until the final LED blinks rapidly and then stops
- release the button: all emails in the connected gmail inbox will be archived.

note: releasing the button anytime before the blinking LED stops blinking will abort the operation.

