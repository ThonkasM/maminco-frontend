import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(token?: string) {
    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", {
            autoConnect: false,
            transports: ["websocket"],
            auth: token ? { token } : undefined,
        });
    }
    return socket;
}

export function resetSocket() {
    if (socket) {
        try {
            socket.disconnect();
        } catch (e) {
            // ignore
        }
        socket = null;
    }
}
