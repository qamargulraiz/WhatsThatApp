import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getChatById, postMessage, postAddMember, deleteChatMember, patchMessage, deleteMessage } from './ChatRequests';
import { URLaddress, loggedUser } from './App';
import { FontAwesome } from '@expo/vector-icons';

export default function Chat({ route }) {
  const { chatId } = route.params;
  const [chat, setChat] = useState({ messages: [] });
  const [inputText, setInputText] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [userId, setUserId] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editedMessageId, setEditedMessageId] = useState(null);
  const [editedMessage, setEditedMessage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const scrollViewRef = useRef();
  const navigation = useNavigation();

  useEffect(() => {
    getChatById(setChat, chatId);
  }, []);

  // Scroll to bottom of the message list whenever a new message is added
  useEffect(() => {
    scrollViewRef.current.scrollToEnd({ animated: true });
  }, [chat.messages]);

  // Function to handle sending a message
  const handleSendMessage = async () => {
    setInputText('');
    console.log('Message sent:', inputText);
    try {
      await postMessage(chatId, inputText);
      await getChatById(setChat, chatId);
    } catch (error) {
      console.log(error);
    }
  };

  // Function to handle adding a member to the chat
  const handleAddMember = async () => {
    console.log('Adding member');
    try {
      await postAddMember(chatId, userId);
      setUserId('');
      await getChatById(setChat, chatId);
    } catch (error) {
      console.log(error);
    }
  };

  // Function to handle removing a member from the chat
  const handleRemoveMember = async (memberId) => {
    console.log('Removing member');
    try {
      await deleteChatMember(chatId, memberId);
      await getChatById(setChat, chatId);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditMessage = (messageId) => {
    setEditedMessageId(messageId);
    setEditMode(true);
    setSelectedMessage(null);
  };

  const handleSaveMessage = async (message, messageId) => {
    try {
      console.log('Editing message:', messageId);
      await patchMessage(chatId, message, messageId);
      setEditedMessage('');
      setSelectedMessage(null);
      setEditMode(false);
      await getChatById(setChat, chatId);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      console.log('Deleting message:', messageId);
      await deleteMessage(chatId, messageId);
      setSelectedMessage(null);
      await getChatById(setChat, chatId);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      {showMembers && (
        <View style={styles.membersContainer}>
          <Text style={styles.membersHeader}>Members</Text>
          {chat.members.map((member) => (
            <View key={member.user_id} style={styles.memberRow}>
              <Text style={styles.memberName}>
                {member.first_name} {member.last_name}
              </Text>
              <TouchableOpacity onPress={() => handleRemoveMember(member.user_id)}>
                <FontAwesome name="trash-o" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.addMemberContainer}>
            <TextInput
              style={styles.addMemberInput}
              placeholder="Enter userId"
              value={userId}
              onChangeText={(value) => setUserId(value)}
            />
            <TouchableOpacity style={styles.addMemberButton} onPress={handleAddMember}>
              <Text style={styles.addMemberButtonText}>Add Member</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>{chat.name}</Text>
        <TouchableOpacity style={styles.membersButton} onPress={() => setShowMembers(!showMembers)}>
          <FontAwesome name="users" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
          contentContainerStyle={styles.messageListContainer}
        >
          {chat.messages.sort((a, b) => a.timestamp - b.timestamp).map((message, index, array) => (
            <View key={index}>
              {index === 0 || new Date(message.timestamp).toDateString() !== new Date(array[index - 1].timestamp).toDateString() ?
                <View style={styles.dateSeparatorContainer}>
                  <Text style={styles.dateSeparatorText}>
                    {new Date(message.timestamp).toDateString()}
                  </Text>
                </View>
                : null}
              <TouchableOpacity
                style={[
                  styles.messageContainer,
                  message.author.user_id === loggedUser.userId ? styles.userMessageContainer : styles.otherMessageContainer
                ]}
                onPress={() => setSelectedMessage(message.message_id)}
              >
                {editedMessageId === message.message_id ?
                  <View style={styles.editMessageInputContainer}>
                    <TextInput
                      style={styles.editMessageInput}
                      value={editedMessage || message.message}
                      onChangeText={(text) => setEditedMessage(text)}
                      autoFocus
                    />
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={() => {
                        handleSaveMessage(editedMessage, message.message_id);
                        setEditedMessageId(null); // clear the edit mode after saving
                      }}
                    >
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                  :
                  <Text>
                    <Text style={message.author.user_id === loggedUser.userId ? styles.userMessageText : styles.otherMessageText}>
                      {message.author.user_id === loggedUser.userId ? '' : `${message.author.first_name}: `}
                    </Text>
                    <Text style={message.author.user_id === loggedUser.userId ? styles.userMessageText : styles.otherMessageText}>
                      {message.message}
                    </Text>
                    <Text style={styles.messageTime}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </Text>
                }
                {selectedMessage === message.message_id && editedMessageId !== message.message_id && (
                  message.author.user_id === loggedUser.userId &&
                  <View style={styles.editDeleteIconsContainer}>
                    <TouchableOpacity style={styles.editIconContainer} onPress={() => handleEditMessage(message.message_id)}>
                      <FontAwesome name="edit" size={20} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteIconContainer} onPress={() => handleDeleteMessage(message.message_id)}>
                      <FontAwesome name="trash" size={20} color="red" />
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          ))}

          {chat && chat.messages && chat.messages.length === 0 && (
            <Text style={styles.noMessagesText}>No messages yet.</Text>
          )}
        </ScrollView>
        <View style={styles.inputContainer}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message"
            style={styles.textInput}
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#fff'
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 10
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3366FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold'
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10
  },
  backButtonText: {
    color: '#3366FF',
    fontWeight: 'bold',
    fontSize: 16
  },
  messageListContainer: {
    flex: 1
  },
  membersContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: '100%',
    width: 200,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 20
  },
  userMessageContainer: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
    borderTopRightRadius: 0
  },
  otherMessageContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 0
  },
  userMessageText: {
    color: '#000000',
    fontSize: 16,
    textAlign: 'right'
  },
  otherMessageText: {
    color: '#000000',
    fontSize: 16,
    textAlign: 'left'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#C8C8C8'
  },
  textInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#C8C8C8',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginRight: 10
  },
  sendButton: {
    backgroundColor: '#3366FF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  noMessagesText: {
    color: '#000000',
    textAlign: 'center',
    marginTop: 20
  },
  membersContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10
  },
  memberName: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold'
  },
  memberStatus: {
    color: '#A0A0A0',
    fontSize: 14
  }
});
