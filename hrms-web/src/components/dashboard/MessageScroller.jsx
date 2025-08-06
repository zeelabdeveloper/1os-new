import { useActiveMessages } from "../../hooks/useMessages";
import { Skeleton } from "antd";
import { NotificationOutlined } from "@ant-design/icons";
import React from "react";

const MessageScroller = () => {
  const { data: messages, isLoading, isError } = useActiveMessages();

  if (isLoading) return <Skeleton active />;
  if (isError) return <div>Error loading messages</div>;
  if (!messages?.length) return null;

  return (
    <>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-200%); }
        }
      
      `}</style>

      <div
        className="w-full  mb-5 !bg-gradient-to-r !from-blue-500 !to-green-500 p-[2px] shadow-md"
        style={{ animation: "fadeIn 0.6s ease-out" }}
      >
        <div className=" flex justify-end  py-3 overflow-hidden">
          <div
            className="inline-block whitespace-nowrap pl-full text-base font-semibold text-white"
            style={{ animation: "marquee 25s linear infinite" }}
          >
            <NotificationOutlined
              color="red"
              className=" text-lg mr-3 align-righ animate-pulse"
            />
            {messages.map((m, i) => (
              <React.Fragment key={m._id}>
                <span>{m.content}</span>
                {i < messages.length - 1 && (
                  <span className="inline-block w-2 h-2 bg-white rounded-full  mx-3 align-middle shadow" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MessageScroller;
