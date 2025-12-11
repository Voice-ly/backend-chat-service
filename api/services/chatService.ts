import * as admin from 'firebase-admin';
import { adminDb } from "../config/firebaseAdmin";

interface StoredChatMessage {
    userId: string;
    name: string;
    message: string;
    timestamp: string;
    roomId: string; // MeetingId
}

/** * Guarda un mensaje en la subcolección: /meetings/{roomId}/chat_history/{documento_chat}
 */
export const storeMessage = async (message: StoredChatMessage): Promise<void> => {
    try {
        const meetingRef = adminDb.collection("meetings").doc(message.roomId);
        const chatHistoryCollection = meetingRef.collection("chat_history");

        await chatHistoryCollection.add({
            userId: message.userId,
            name: message.name,
            message: message.message,
            timestamp: message.timestamp,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error("Error saving message to Firestore subcollection:", error);
        throw new Error("Failed to save chat message.");
    }
};

export const getHistoryByRoomId = async (roomId: string) => {
    
    const meetingRef = adminDb.collection("meetings").doc(roomId);
    const chatHistoryCollection = meetingRef.collection("chat_history");

    // Firestore devolverá los documentos sin un orden garantizado, pero los devolverá.
    const snapshot = await chatHistoryCollection
        .get();

    const chatHistory = snapshot.docs.map(doc => {
        const data = doc.data() as any; 
        
        console.log(`[DEBUG CHAT SERVICE] Documento crudo de chat ${doc.id}:`, JSON.stringify(data));

        return {
            user: data.name || data.user,      
            text: data.message || data.text,   
            timestamp: data.timestamp || data.createdAt, 
        };
    });
    
    console.log("[DEBUG CHAT SERVICE] Historial de chat final devuelto:", chatHistory);

    return chatHistory;
};