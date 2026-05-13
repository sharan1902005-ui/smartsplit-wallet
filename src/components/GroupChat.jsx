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
  const user = auth.currentUser;

  const sendMessage = async () => {
    if (!message.trim()) return;

    await updateDoc(doc(db, "groups", group.id), {
      chatMessages: arrayUnion({
        id: Date.now(),
        text: message,
        userId: user.uid,
        userName:
          user.displayName ||
          user.email ||
          "User",
        userPhoto: user.photoURL || "",
        createdAt: new Date().toISOString(),
      }),
    });

    setMessage("");
  };

  const messages = (group.chatMessages || []).sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-red-100 dark:border-slate-700 p-8">
      <h2 className="text-3xl font-bold text-red-600 mb-6">
        Group Chat
      </h2>

      <div className="space-y-4 max-h-[400px] overflow-y-auto p-4 bg-[#fff8f2] dark:bg-slate-900 rounded-3xl">
        {messages.length === 0 ? (
          <p className="text-slate-500 text-center py-8">
            No messages yet. Say hi! 👋
          </p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end gap-3 ${
                message.userId === user.uid
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              {message.userId !== user.uid && (
                <img
                  src={
                    message.userPhoto ||
                    `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${message.userName}`
                  }
                  alt={message.userName}
                  className="w-10 h-10 rounded-full shadow-md"
                />
              )}

              <div
                className={`max-w-[70%] rounded-3xl px-5 py-3 shadow-md ${
                  message.userId === user.uid
                    ? "bg-gradient-to-r from-red-500 to-orange-500 text-white"
                    : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                }`}
              >
                {message.userId !== user.uid && (
                  <p className="text-xs font-bold mb-1 opacity-70">
                    {message.userName}
                  </p>
                )}

                <p className="text-sm">
                  {message.text}
                </p>

                <p className="text-[10px] mt-2 opacity-70 text-right">
                  {message.createdAt?.toDate
                    ? message.createdAt
                        .toDate()
                        .toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                    : new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type message..."
          className="flex-1 px-5 py-4 rounded-2xl border border-red-200 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
        />

        <button
          onClick={sendMessage}
          className="px-6 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold shadow-lg flex items-center gap-2"
        >
          <Send size={18} />
          Send
        </button>
      </div>
    </div>
  );
}
