import { useState } from "react";
import {
  doc,
  updateDoc,
  arrayUnion
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { Send } from "lucide-react";

export default function GroupChat({ group }) {
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    if (!message.trim()) return;

    await updateDoc(doc(db, "groups", group.id), {
      chatMessages: arrayUnion({
        id: Date.now(),
        text: message,
        userId: auth.currentUser.uid,
        userName:
          auth.currentUser.displayName ||
          auth.currentUser.email ||
          "User",
        userPhoto:
          auth.currentUser.photoURL || "",
        createdAt: new Date().toISOString(),
      }),
    });

    setMessage("");
  };

  const messages = (group.chatMessages || []).sort(
    (a, b) =>
      new Date(a.createdAt) - new Date(b.createdAt)
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-red-100 dark:border-slate-700 p-8">
      <h2 className="text-3xl font-bold text-red-600 mb-6">
        Group Chat
      </h2>

      <div className="max-h-[400px] overflow-y-auto space-y-4 mb-6">
        {messages.length === 0 ? (
          <p className="text-slate-500">
            No messages yet.
          </p>
        ) : (
          messages.map((msg) => {
            const isMe =
              msg.userId === auth.currentUser.uid;

            return (
              <div
                key={msg.id}
                className={`flex ${
                  isMe
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl p-4 ${
                    isMe
                      ? "bg-gradient-to-r from-red-500 to-orange-500 text-white"
                      : "bg-[#fff8f2] dark:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={
                        msg.userPhoto ||
                        "https://ui-avatars.com/api/?name=User"
                      }
                      alt=""
                      className="w-8 h-8 rounded-full"
                    />

                    <span className="font-bold text-sm">
                      {msg.userName}
                    </span>
                  </div>

                  <p>{msg.text}</p>

                  <p className="text-xs opacity-70 mt-2">
                    {new Date(
                      msg.createdAt
                    ).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex gap-3">
        <input
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          placeholder="Type message..."
          className="flex-1 p-4 rounded-2xl border border-red-100 dark:border-slate-700 bg-white dark:bg-slate-800"
        />

        <button
          onClick={sendMessage}
          className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 rounded-2xl font-bold flex items-center gap-2"
        >
          <Send size={18} />
          Send
        </button>
      </div>
    </div>
  );
}