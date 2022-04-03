import io from "socket.io-client";

export const socket = io(process.env.API_URL); // Initiate the socket connection to the API