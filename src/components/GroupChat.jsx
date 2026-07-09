import { useState } from "react";
import {
  doc,
  updateDoc,
  arrayUnion
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { MessageCircle, Send } from "lucide-react";
import MemberAvatar from "./MemberAvatar";
import { cleanDisplayName } from "../utils/memberDisplay";

export default function GroupChat({ group }) {
  const [message, setMessage] = useState("");
  const user = auth.currentUser;

  const sendMessage = async () => {
    if (!message.trim() || !user) return;

    await updateDoc(doc(db, "groups", group.id), {
      chatMessages: arrayUnion({
        id: Date.now(),
        text: message.trim(),
        userId: user.uid,
        userName: cleanDisplayName(user.displayName || user.email, "User"),
        userPhoto: user.photoURL || "",
        createdAt: new Date().toISOString(),
      }),
    });

    setMessage("");
  };

  const messages = (group.chatMessages || [])
    .filter((item) => item?.text?.trim())
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <section className="rounded-md border border-[#C7B98F] bg-[#F8F4EA] p-6 shadow-sm dark:border-[#3a352b] dark:bg-[#221F1A]">
      <div className="mb-5">
        <h2 className="font-['Big_Shoulders_Display'] text-3xl font-extrabold uppercase tracking-tight text-[#24322E] dark:text-[#EFE7D6]">
          Group Chat
        </h2>
        <p className="text-sm text-[#6b6350] dark:text-[#a89a6d]">
          Keep trip updates and expense context in one place
        </p>
      </div>

      <div className="relative border-t-2 border-dashed border-[#C7B98F] dark:border-[#3a352b] my-5">
        <div className="absolute -left-9 -top-3 w-6 h-6 rounded-full bg-[#EAE1CC] dark:bg-[#171512]" />
        <div className="absolute -right-9 -top-3 w-6 h-6 rounded-full bg-[#EAE1CC] dark:bg-[#171512]" />
      </div>

      <div className="min-h-[420px] space-y-4 max-h-[560px] overflow-y-auto rounded-md border border-[#C7B98F] bg-[#EAE1CC] p-4 dark:border-[#3a352b] dark:bg-[#171512]">
        {messages.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full border border-[#C7B98F] bg-[#F8F4EA] p-4 text-[#B23A2E] dark:border-[#3a352b] dark:bg-[#221F1A]">
              <MessageCircle size={28} />
            </div>
            <p className="font-['Big_Shoulders_Display'] text-2xl font-extrabold uppercase tracking-tight text-[#24322E] dark:text-[#EFE7D6]">
              No messages yet - say hi.
            </p>
            <p className="mt-2 max-w-sm text-sm text-[#6b6350] dark:text-[#a89a6d]">
              The first message will appear here with the sender avatar and time.
            </p>
          </div>
        ) : (
          messages.map((chatMessage) => {
            const isCurrentUser = chatMessage.userId === user?.uid;
            const chatName = cleanDisplayName(chatMessage.userName, "Member");

            return (
              <div
                key={chatMessage.id}
                className={`flex items-end gap-3 ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isCurrentUser && (
                  <MemberAvatar
                    src={chatMessage.userPhoto}
                    name={chatName}
                    className="w-10 h-10 rounded-full shadow-md"
                  />
                )}

                <div
                  className={`max-w-[70%] rounded-md px-5 py-3 shadow-sm ${
                    isCurrentUser
                      ? "bg-[#B23A2E] hover:bg-[#9a3227] text-[#F8F4EA]"
                      : "bg-[#F8F4EA] dark:bg-[#221F1A] text-[#24322E] dark:text-[#EFE7D6] border border-[#C7B98F] dark:border-[#3a352b]"
                  }`}
                >
                  {!isCurrentUser && (
                    <p className="text-xs font-bold mb-1 opacity-70">
                      {chatName}
                    </p>
                  )}

                  <p className="text-sm">
                    {chatMessage.text}
                  </p>

                  <p className="mt-2 text-right font-['IBM_Plex_Mono'] text-[10px] opacity-70">
                    {chatMessage.createdAt?.toDate
                      ? chatMessage.createdAt
                          .toDate()
                          .toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                      : new Date(chatMessage.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type message..."
          className="flex-1 rounded-md border border-[#C7B98F] bg-[#F8F4EA] px-5 py-4 text-[#24322E] focus:outline-none focus:ring-4 focus:ring-[#B23A2E]/20 dark:border-[#3a352b] dark:bg-[#221F1A] dark:text-[#EFE7D6]"
        />

        <button
          onClick={sendMessage}
          className="px-6 rounded-md bg-[#B23A2E] hover:bg-[#9a3227] text-[#F8F4EA] font-bold shadow-lg flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-[0.99]"
        >
          <Send size={18} />
          Send
        </button>
      </div>
    </section>
  );
}
