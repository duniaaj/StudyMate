import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
import { initializeRealm } from '../../DBase';

function ChatRoom({ route }) {
  const { chatRoomId, chatRoomName, userid } = route.params;
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [realm, setRealm] = useState(null);

  const fetchMessages = async (chatRoomId) => {
    try {
      const realmInstance = await initializeRealm();
      setRealm(realmInstance);
      const chatRoom = realmInstance.objectForPrimaryKey('ChatRoom', chatRoomId);
      if (chatRoom) {
        const fetchedMessages = chatRoom.messages.sorted('timestamp').map((msg) => ({
          _id: msg.id,
          text: msg.text,
          createdAt: msg.timestamp,
          user: {
            _id: msg.senderId.stu_id,
            name: msg.senderId.name,
            avatar: 'https://placeimg.com/140/140/any', // default avatar
          },
        }));
        setMessages(fetchedMessages.reverse());
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUser = async () => {
    try {
      const realmInstance = await initializeRealm();
      setRealm(realmInstance);
      const userData = realmInstance.objects('Student').filtered('stu_id = $0', userid)[0];
      setUser({
        _id: userData.stu_id,
        name: userData.name,
        avatar: 'https://placeimg.com/140/140/any', // default avatar
      });
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  useEffect(() => {
    fetchMessages(chatRoomId);
    fetchUser();

    return () => {
      if (realm) {
        realm.close();
      }
    };
  }, [chatRoomId]);

  const onSend = useCallback((newMessages = []) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));
    
    const message = newMessages[0];
    sendMessage(chatRoomId, message.text, user);
  }, [user, chatRoomId]);

  const sendMessage = async (chatRoomId, text, sender) => {
    try {
      if (!realm || !chatRoomId || !text || !sender) {
        console.error('Invalid parameters');
        return;
      }

      const chatRoom = realm.objectForPrimaryKey('ChatRoom', chatRoomId);
      if (!chatRoom) {
        console.error('Chat room not found');
        return;
      }

      const newMessage = {
        id: Math.floor(Math.random() * 10000),
        text: text,
        timestamp: new Date(),
        chatRoomId: chatRoom,
        senderId: sender,
      };

      console.log('Creating new message:', newMessage);

      realm.write(() => {
        realm.create('Message', newMessage);
      });

    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.header}>{chatRoomName}</Text>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={user}
        renderBubble={(props) => (
          <Bubble
            {...props}
            wrapperStyle={{
              right: { backgroundColor: '#007BFF' },
              left: { backgroundColor: '#E8E8E8' },
            }}
          />
        )}
        renderInputToolbar={(props) => <InputToolbar {...props} containerStyle={styles.inputToolbar} />}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  inputToolbar: {
    borderTopWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
  },
});

export default ChatRoom;
