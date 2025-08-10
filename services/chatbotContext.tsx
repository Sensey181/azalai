import React, { createContext, ReactNode, useContext, useState } from 'react';

interface ChatbotContextType {
  isModalVisible: boolean;
  showChatbotModal: () => void;
  hideChatbotModal: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};

interface ChatbotProviderProps {
  children: ReactNode;
}

export const ChatbotProvider: React.FC<ChatbotProviderProps> = ({ children }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showChatbotModal = () => {
    setIsModalVisible(true);
  };

  const hideChatbotModal = () => {
    setIsModalVisible(false);
  };

  return (
    <ChatbotContext.Provider value={{ isModalVisible, showChatbotModal, hideChatbotModal }}>
      {children}
    </ChatbotContext.Provider>
  );
};


