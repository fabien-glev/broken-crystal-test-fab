import type { FC } from 'react';
import Header from '../main/Header/Header';
import ChatWidget from './ChatWidget';

export const Chat: FC = () => {
  return (
    <>
      <Header onInnerPage={true} />
      <section className="chat">
        <div className="container" data-aos="fade-up">
          <ChatWidget />
        </div>
      </section>
    </>
  );
};

export default Chat;
