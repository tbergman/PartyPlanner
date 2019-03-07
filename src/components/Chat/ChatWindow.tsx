import React from 'react';
import styled from '@emotion/styled';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import useChatWindow from '../../hooks/useChatWindow';

const ChatWindowWrapper = styled.div`
  flex: 1;
  display: flex;
  height: calc(100vh - 64px);
  flex-direction: column;
  position: relative;
`;

const NewMessagesBelowNotifier = styled.div`
  position: absolute;
  bottom: 40px;
  width: 250px;
  margin: 0 auto;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  border: 2px dashed #d9d9d9;
  border-bottom: 0;
  left: 0;
  right: 0;
  height: 35px;
  background: white;
  text-align: center;
  cursor: pointer;
  line-height: 35px;
`;

const ChatWindow: React.FC = () => {
  const chatMessagesInnerRef = React.useRef<HTMLDivElement>(null);

  const { scrollToBottom, isWithinBottomLockRange } = useChatWindow(
    chatMessagesInnerRef
  );

  function onNewChatMessage() {
    scrollToBottom(250);
  }

  return (
    <ChatWindowWrapper>
      <ChatMessages
        scrollToBottom={scrollToBottom}
        isWithinBottomLockRange={isWithinBottomLockRange}
        onNewMessage={onNewChatMessage}
        ref={chatMessagesInnerRef}
      />
      {!isWithinBottomLockRange && (
        <NewMessagesBelowNotifier onClick={() => scrollToBottom()}>
          <h3>New messages below</h3>
        </NewMessagesBelowNotifier>
      )}
      <ChatInput />
    </ChatWindowWrapper>
  );
};

export default ChatWindow;
