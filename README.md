# beacon
*beacon* is a network based, local music focused, music player built for the web.

1. [About](#About)
2. [Installation](#Installation)
3. [Usage](#Usage)

## About
I created beacon as a gift for my sister (and also myself). It is a mix of two features I fell in love with: the idea of being able to sync all my local music into the cloud thanks to Google Play Music, and the ability to control music play in a different device than the playing one thanks to Spotify.

Thought it'd be very *ucking great to have a raspberry pi on my local network connected to a hard drive with all my music and the home cinema and be able to control the music playing on this raspberry from a different device, or to listen to music from the raspberry in my phone without having to download the music in my phone.

## Installation
Make sure you have [node](https://nodejs.org) installed on your machine.
```bash
node -v
```

Clone this repository:
```bash
git clone https://github.com/subiabre/beacon.git
```

Install dependencies:
```bash
cd beacon
npm install
```

## Usage
Once installed, beacon is ready to cast. It comes wrapped in a nice CLI app where you can control and do some debugging in case you need. I believe even your grandma can flash this thing up and start using it.

```bash
node beacon.js
```
