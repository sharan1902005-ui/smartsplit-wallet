import { useState } from "react";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "../firebase/config";

export default function GroupChat({ group }) {
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    if (!message.trim()) return;

    await updateDoc(doc(db, "groups", group.id), {
      messages: arrayUnion({
        text: message,
        sender: auth.currentUser.email,
        createdAt: new Date().toISOString(),
      }),
    });

    setMessage("");
  };

  return (
    <div className="bg-slate-900 rounded-3xl p-8 shadow-xl mt-10">
      <h2 className="text-3xl font-bold mb-6">
        Group Chat
      </h2>

      <div className="space-y-4 max-h-[400px] overflow-y-auto mb-6">
        {(group.messages || []).map((msg, index) => (
          <div
            key={index}
            className="bg-slate-800 p-4 rounded-2xl"
          >
            <p className="font-bold text-indigo-400">
              {msg.sender}
            </p>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Type message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 p-4 rounded-xl bg-slate-800 text-white"
        />

        <button
          onClick={sendMessage}
          className="bg-indigo-600 hover:bg-indigo-500 px-6 rounded-xl"
        >
          Send
        </button>
      </div>
    </div>
  );
}
