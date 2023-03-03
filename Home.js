import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { URLaddress, loggedUser } from './App';
import { getContacts, postContact, deleteContact, getBlockedContacts, postBlockContact, deleteBlockedContact } from './Contact';
import { FontAwesome } from '@expo/vector-icons';
import { getUserInfo, patchUserInfo, postLogout } from './UserRequests';
import { getChats, postChat, patchChat } from './ChatRequests';

// Example data for chats and contacts
const exampleChats = [
  { id: 1, name: 'Alice', lastMessage: 'Hey, how are you?' },
  { id: 2, name: 'Jack', lastMessage: 'See you tomorrow!' },
  { id: 3, name: 'Lenny', lastMessage: 'Can you send me that file?' },
];

const exampleContacts = [
  { user_id: 1, first_name: 'Alice', last_name: 'Mc', email: 'alice@gmail.com' },
  { user_id: 2, first_name: 'Jack', last_name: 'Sparrow', email: 'jack@gmail.com' },
  { user_id: 3, first_name: 'Lenny', last_name: 'Stuart', email: 'lenny@gmail.com' },
];

// Define Chats component
function Chats() {
  const navigation = useNavigation();
  const [chats, setChats] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [chatName, setChatName] = useState('');
  const [editChatId, setEditChatId] = useState(null);

  useEffect(() => {
    getChats([chats, setChats]);
  }, []);

  const handleAddChat = () => {
    setShowInput(true);
  };

  const handleCreateChat = () => {
    postChat(chatName)
      .then(() => {
        setShowInput(false);
        setChatName('');
        getChats([chats, setChats]);
      })
      .catch(error => {
        console.error('Error creating chat: ', error);
      });
  };

  const handleEditChat = (chatId) => {
    setEditChatId(chatId);
    setShowInput(true);
  }

  const handleSaveEdit = () => {
    patchChat(editChatId, chatName)
      .then(() => {
        setShowInput(false);
        setEditChatId(null);
        setChatName('');
        getChats([chats, setChats]);
      })
      .catch(error => {
        console.error('Error editing chat: ', error);
      });
  }

  const handleChatPress = (chatId) => {
    navigation.navigate('Chat', { chatId });
  }

  function handleHideInput() {
    setShowInput(false);
  }

  return (
    <View style={styles.tabContent}>
      {chats.map(chat => (
        <TouchableOpacity key={chat.chat_id} style={styles.homeItem} onPress={() => handleChatPress(chat.chat_id)}>
          <View style={styles.homeItemView}>
            <Text style={styles.homeItemName}>{chat.name}</Text>
            <TouchableOpacity style={styles.homeItemIcons} onPress={() => handleEditChat(chat.chat_id)}>
              <FontAwesome name="edit" size={20} color="#000" />
            </TouchableOpacity>
          </View>
          <Text style={styles.chatLastMessage}>
            {chat.last_message && Object.keys(chat.last_message).length !== 0
              ? chat.last_message.message || "No messages yet"
              : "No messages yet"}
          </Text>
        </TouchableOpacity>
      ))}
      {showInput ? (
        <>
          <TouchableOpacity style={styles.overlay} onPress={() => setShowInput(false)} />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Chat name"
              value={chatName}
              onChangeText={setChatName}
            />
            <TouchableOpacity style={styles.saveButton} onPress={editChatId ? handleSaveEdit : handleCreateChat}>
              <Text style={styles.saveButtonText}>{editChatId ? 'Save' : 'Create'}</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <TouchableOpacity style={styles.newItemButton} onPress={handleAddChat}>
          <FontAwesome name="comment" size={20} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}


// Define Contacts component
function Contacts() {

  const [contacts, setContacts] = useState([]);
  const [blockedcontacts, setBlockedContacts] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    getContacts([contacts, setContacts]);
    getBlockedContacts([blockedcontacts, setBlockedContacts]);
  }, []);

  const handleAddContact = () => {
    setShowInput(true);
  };

  const handleSaveContact = () => {
    // call API to save the contact with the provided user ID
    postContact(userId)
      .then(() => {
        setShowInput(false);
        setUserId('');
        // call getContacts to update the contacts list with the new contact
        getContacts([contacts, setContacts]);
      })
      .catch(error => {
        console.error('Error saving contact: ', error);
      });
  };

  const handleDeleteContact = (contactId) => {
    // call API to delete the contact with the given ID
    deleteContact(contactId)
      .then(() => {
        // filter out the deleted contact from the contacts list
        setContacts(contacts.filter(contact => contact.user_id !== contactId));
      })
      .catch(error => {
        console.error('Error deleting contact: ', error);
      });
  };

  const handleBlockContact = (contactId) => {
    // call API to block the contact with the given ID
    postBlockContact(contactId);
  };

  const handleUnblockContact = (contactId) => {
    // call API to block the contact with the given ID
    deleteBlockedContact(contactId);
  };


  return (
    <View style={styles.tabContent}>
      {contacts.map((contact, index) => (
        <View key={contact.user_id} style={styles.homeItem}>
          <View style={styles.homeItemView}>
            <Text style={styles.homeItemName}>{contact.first_name} {contact.last_name}</Text>
            <TouchableOpacity style={styles.homeItemIcons} onPress={() => handleDeleteContact(contact.user_id)}>
              <FontAwesome name="trash-o" size={20} color="#FF0000" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.homeItemIcons} onPress={() => handleBlockContact(contact.user_id)}>
              <FontAwesome name="unlock-alt" size={20} color="#000000" />
            </TouchableOpacity>

          </View>
          {index !== contacts.length - 1 && <View style={styles.separator} />}
        </View>
      ))}
      {blockedcontacts.length > 0 && (
        <>
          <View style={styles.separator} />
          <Text style={styles.blockedHeaderText}>Blocked Contacts</Text>
          {blockedcontacts.map((contact, index) => (
            <View key={contact.user_id} style={styles.homeItem}>
              <View style={styles.homeItemView}>
                <Text style={styles.homeItemName}>{contact.first_name} {contact.last_name}</Text>
                <TouchableOpacity style={styles.homeItemIcons} onPress={() => handleDeleteContact(contact.user_id)}>
                  <FontAwesome name="trash-o" size={20} color="#FF0000" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.homeItemIcons} onPress={() => handleUnblockContact(contact.user_id)}>
                  <FontAwesome name="lock" size={20} color="#000000" />
                </TouchableOpacity>

              </View>
              {index !== blockedcontacts.length - 1 && <View style={styles.separator} />}
            </View>
          ))}
        </>
      )}
      {showInput ? (
        <>
          <TouchableOpacity style={styles.overlay} onPress={() => setShowInput(false)} />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="User ID"
              value={userId}
              onChangeText={setUserId}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveContact}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <TouchableOpacity style={styles.newItemButton} onPress={handleAddContact}>
          <FontAwesome name="user-plus" size={20} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

function Profile() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState(null);
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    // call the getUserInfo function and update state variables with the user information
    getUserInfo(loggedUser.userId)
      .then((data) => {
        setName(data.first_name);
        setSurname(data.last_name);
        setEmail(data.email);
        setPassword(data.password);
      })
      .catch((error) => {
        console.error('Error getting user info: ', error);
      });
  }, []);

  const handleUpdateProfile = (field) => {
    switch (field) {
      case 'name':
        patchUserInfo({ first_name: name });
        break;
      case 'surname':
        patchUserInfo({ last_name: surname });

        break;
      case 'email':
        patchUserInfo({ email: email });

        break;
      case 'password':
        patchUserInfo({ password: password });

        break;
      default:
        break;
    }
  };

  const handleImageChange = (event) => {
    const { uri } = event.nativeEvent;
    setImage(uri);
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
  };

  const navigation = useNavigation();

  const handleLogout = async () => { // Add async keyword here
    // navigate the user back to the sign-in screen
    await postLogout();
    console.log(loggedUser);
    navigation.navigate('SignIn');
  };

  return (
    <View style={styles.tabContent}>
      <View style={styles.profileImageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.profileImage} />
        ) : (
          <FontAwesome name="user" size={100} color="#555" />
        )}
        <TouchableOpacity style={styles.editImageButton}>
          <Text style={styles.editImageButtonText}>Edit Image</Text>
          <TextInput style={styles.hiddenInput} onChange={handleImageChange} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.showUpdateButton} onPress={() => setShowUpdate(true)}>
        <Text style={styles.showUpdateButtonText}>Update Profile</Text>
      </TouchableOpacity>
      {showUpdate ? (
        <View style={styles.profileInfo}>
          <View style={{ width: '100%', marginBottom: 10 }}>
            <TextInput
              style={styles.inputProfile}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
            <TouchableOpacity
              style={styles.updateButtonProfile}
              onPress={() => handleUpdateProfile('name')}
            >
              <FontAwesome name="pencil" style={styles.updateButtonIcon} />
            </TouchableOpacity>
          </View>
          <View style={{ width: '100%', marginBottom: 10 }}>
            <TextInput
              style={styles.inputProfile}
              placeholder="Surname"
              value={surname}
              onChangeText={setSurname}
            />
            <TouchableOpacity
              style={styles.updateButtonProfile}
              onPress={() => handleUpdateProfile('surname')}
            >
              <FontAwesome name="pencil" style={styles.updateButtonIcon} />
            </TouchableOpacity>
          </View>
          <View style={{ width: '100%', marginBottom: 10 }}>
            <TextInput
              style={styles.inputProfile}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
            />
            <TouchableOpacity
              style={styles.updateButtonProfile}
              onPress={() => handleUpdateProfile('email')}
            >
              <FontAwesome name="pencil" style={styles.updateButtonIcon} />
            </TouchableOpacity>
          </View>
          <View style={{ width: '100%', marginBottom: 10 }}>
            <TextInput
              style={styles.inputProfile}
              placeholder="Password"
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.updateButtonProfile}
              onPress={() => handleUpdateProfile('password')}
            >
              <FontAwesome name="pencil" style={styles.updateButtonIcon} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.profileInfoMain}>
          <Text style={styles.profileText}>
            {`${name} ${surname}`}
            <Text>{'\n'}</Text>
            {`${email}`}
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={() => handleLogout()}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

    </View>
  );
}

export default function Home({ navigation }) {

  const [activeTab, setActiveTab] = useState('Chats');

  return (
    <View style={styles.container}>
      {/* Nav bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Profile' && styles.activeTabButton]}
          onPress={() => setActiveTab('Profile')}
        >
          {activeTab === 'Profile' ? (
            <Text style={[styles.tabButtonText, styles.activeTabButtonText]}>Profile</Text>
          ) : (
            <FontAwesome name="user-o" size={18} color="#fff" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Chats' && styles.activeTabButton]}
          onPress={() => setActiveTab('Chats')}
        >
          {activeTab === 'Chats' ? (
            <Text style={[styles.tabButtonText, styles.activeTabButtonText]}>Chats</Text>
          ) : (
            <FontAwesome name="comments" size={18} color="#fff" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Contacts' && styles.activeTabButton]}
          onPress={() => setActiveTab('Contacts')}
        >
          {activeTab === 'Contacts' ? (
            <Text style={[styles.tabButtonText, styles.activeTabButtonText]}>Contacts</Text>
          ) : (
            <FontAwesome name="address-book-o" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Tab content */}
      {activeTab === 'Chats' ? <Chats /> : activeTab === 'Contacts' ? <Contacts /> : <Profile />}
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#007aff',
    height: 60,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonContent: {
    paddingHorizontal: 10,
  },
  tabButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  activeTabButton: {
    flex: 3,
    borderBottomWidth: 2,
    borderBottomColor: '#fff',
  },
  activeTabButtonText: {
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editImageButton: {
    marginTop: 10,
  },
  editImageButtonText: {
    color: 'blue',
  },
  hiddenInput: {
    display: 'none',
  },
  showUpdateButton: {
    marginTop: 10,
  },
  showUpdateButtonText: {
    color: 'blue',
  },
  profileInfo: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  updateButtonProfile: {
    backgroundColor: 'transparent',
    height: 30,
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },
  updateButtonIcon: {
    color: 'blue',
    fontSize: 18,
  },
  updateButtonText: {
    color: 'white',
    flex: 1,
  },
  profileInfoMain: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  changeImageButton: {
    backgroundColor: '#007aff',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  changeImageButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  submitButton: {
    backgroundColor: '#007aff',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  profileName: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 20,
  },
  profileEmail: {
    color: '#777',
    fontSize: 14,
    marginTop: 5,
  },
  inputProfile: {
    width: '70%',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  homeItem: {
    width: '100%',
    padding: 20,
    backgroundColor: '#f0f0f0',
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  homeItemView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  homeItemName: {
    flex: 5,
    fontWeight: 'bold',
    fontSize: 16,
  },
  homeItemIcons: {
    flex: 1,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    marginBottom: 10,
  },
  chatLastMessage: {
    color: '#777',
    fontSize: 14,
  },
  newItemButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    backgroundColor: '#3366FF',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,

    elevation: 7,
  },
  newContactButtonText: {
    color: '#fff',
    fontSize: 32,
    lineHeight: 32,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  inputContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -150 }, { translateY: -100 }],
    width: 300,
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#3366FF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
});