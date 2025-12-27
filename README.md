//Setup and Installation

//To run this app run the command:

yarn install or yarn

//After installing dependencies run this command:

npm run tauri dev

//This will start the app in web view. You can start recording and see the transcript, give it permissions to allow recording.

//NOTE: in mac you might have to enable the app you running this on for like VScode in system setting > privacy and security > accessibility > add the app you running this on VScode or cursor or whatever terminal you are using.

// If that doesnt work you can use the command "npm run tauri build" and install the app and add it to your applications and then allow application in system setting as shown earlier setting > privacy and security > accessibility > add the app

//Usage

//You can toggle recording pressing:

Mac: option + K

Windows: Alt + K

//After toggling the recording on the transcription starts and whatever text input you select it start typing transcription for you there.

//Challenges Faced

Mac Permissions: The main challenges I faced here was getting mac permissions , as tauri dont use Info.plist any longer so i had to create it and configure mac permissions there, before that I was unaware why the app is not working

State Management: Another challenged I faced was recurring multiple connections on toggle and also toggle not wokrking something , I fixed both of these by simple using useRef hook to store the variables and make them no trigger rerender and also hold their value across rerenders

Input Handling: Another issue was it was registering toggle multiple times when i pressed it so I simply added a delay of 500ms for that.

Architecture

I also seprated the three concerns of this app -

The rust main logic which actually talks to the OS , listens for keyboard events and stimulates keyboard typigng for transcription.

The audio enginge in the useAudioRecording hook which asks the audio recording permission and streams the audio in chunks of 150ms each and sends the binary data to the frontend

The frontend App.tsx where the Ui lives and coordinates all the elements together

Short Note: It was a greate learning oopurtunity as this is the first time i made a desktop level application and learned how can we implement systems programming with react using typescript which i my strong suite.