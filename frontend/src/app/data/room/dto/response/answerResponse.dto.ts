export interface WebRTCResponse {
    roomId: string;
    answer: RTCSessionDescriptionInit;
    userId: string;
    sid: string;
}