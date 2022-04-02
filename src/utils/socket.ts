import io from "socket.io-client";

export const socket = io(API_URL); // Initiate the socket connection to the API