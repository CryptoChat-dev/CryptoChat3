# CryptoChat 3 [![CodeFactor](https://www.codefactor.io/repository/github/cryptochat-dev/cryptochat3/badge)](https://www.codefactor.io/repository/github/cryptochat-dev/cryptochat3)

CryptoChat 3 is a simple, secure and beautiful chat webapp. Chatting has never been so satisfying.

This new version of CryptoChat makes use of an ultra-fast and lightweight frontend framework called [Svelte](https://svelte.dev).

## Features

Here's an overview of the features CryptoChat has to offer.

### Simple UI

CryptoChat has barely any clutter on its user interface. It's a simple, yet featured, interface that anybody could use--even your grandma!

![Room Creation](https://cdn.horizon.pics/Y2U5FIjBNZHVTL2JGA6EVTCI1YXTBl.png)

![Dark Theme](https://cdn.horizon.pics/WNRDioQuvcouPzomDi04SbDLPSU9k0.png)

![Uploading File](https://cdn.horizon.pics/LBqGf46iBH6pdfkkVRi4yZU7VFzdA8.png)

![Light Theme](https://cdn.horizon.pics/pLSoCQKuCvWEVGBWt4WEI6QGMgbf5L.png)

### Secure File Transfer

CryptoChat supports end-to-end encrypted file transfer, so you can send sensitive files without leaving a trace.

### Encryption

All messages sent through the official CryptoChat clients are end-to-end encrypted locally, meaning nobody except for the message recipients can read their contents. If you need more piece of mind during your chats, use the random key generator for an extra-secure key (it would take 27,255,689 years to crack!<sub>[Source](https://www.rempe.us/diceware/#eff)</sub>).

### Ephemeral

Message history is _never_ stored when using CryptoChat clients. Not on the server, not on the client, not anywhere. When the browser tab goes, so does the chat history.

### Cross-Compatible

Since CryptoChat uses web frameworks, all you need is an electronic device with a web browser. Whether the device is a smartphone, tablet, game console or desktop computer, you can take CryptoChat with you everywhere.

### Open-Source

CryptoChat is open-source meaning that anybody can see its interworkings. This allows the community to improve on its codebase and spot potential security vulnerabilities, leading to an awesome product.

## Encryption Architecture

CryptoChat3 uses the native window.crypto API to encrypt all usernames and messages using authenticated AES-256-GCM with the specified encryption/room key. All ciphertexts use securely generated random values for IV and salt.

To be continued...