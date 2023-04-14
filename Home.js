import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, TouchableWithoutFeedback, FlatList, Picker } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Table, Row } from 'react-native-table-component';
import { URLaddress } from './App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-picker';
import axios from 'axios';
import { Camera } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { getContacts, postContact, deleteContact, getBlockedContacts, postBlockContact, deleteBlockedContact } from './ContactRequests';
import CameraTakePicture from './cameratoServer';
import { FontAwesome } from '@expo/vector-icons';
import { getUserInfo, patchUserInfo, postLogout } from './UserRequests';
import { getChats, postChat, patchChat } from './ChatRequests';




const ErrorBanner = ({ message }) => {
  return (
    <View style={styles.errorBanner}>
      <Text style={{ color: 'white', fontWeight: 'bold' }}>{message}</Text>
    </View>
  );
};

// Define Chats component
function Chats() {
  const navigation = useNavigation();
  const [chats, setChats] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [chatName, setChatName] = useState('');
  const [editChatId, setEditChatId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getChats([chats, setChats]);
  }, []);

  useEffect(() => {
    if (errorMessage) {
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    }
  }, [errorMessage]);

  const handleAddChat = () => {
    setShowInput(true);
  };

  const handleCreateChat = () => {
    if (!chatName.trim()) {
      setErrorMessage('Please enter a valid chat name.'); return;
      return;
    }
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
    if (!chatName.trim()) {
      setErrorMessage('Please enter a valid chat name.'); return;
      return;
    }
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
      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
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
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getContacts([contacts, setContacts]);
    getBlockedContacts([blockedcontacts, setBlockedContacts]);
  }, []);

  useEffect(() => {
    if (errorMessage) {
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    }
  }, [errorMessage]);

  const handleAddContact = () => {
    setShowInput(true);
  };

  const handleSaveContact = () => {
    if (!userId.trim()) {
      setErrorMessage('Please enter a valid User Id.');
      return;
    }
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
    postBlockContact(contactId)
      .then(() => {
        // call getContacts to update the contacts list with the new contact
        getContacts([contacts, setContacts]);
        getBlockedContacts([blockedcontacts, setBlockedContacts]);

      })
      .catch(error => {
        console.error('Error blocking contact: ', error);
      });
  };

  const handleUnblockContact = (contactId) => {
    // call API to block the contact with the given ID
    deleteBlockedContact(contactId)
      .then(() => {
        // call getContacts to update the contacts list with the new contact
        getContacts([contacts, setContacts]);
        getBlockedContacts([blockedcontacts, setBlockedContacts]);
      })
      .catch(error => {
        console.error('Error blocking contact: ', error);
      });
  };


  return (
    <View style={styles.tabContent}>
      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
      {contacts.length > 0 && (
        <>
          <View style={styles.unblockedHeaderContainer}>
            <Text style={styles.contactHeaderText}>Unblocked Contacts</Text>
          </View>
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
            </View>
          ))}
        </>
      )}
      {blockedcontacts.length > 0 && (
        <>
          <View style={styles.blockedHeaderContainer}>
            <Text style={styles.contactHeaderText}>Blocked Contacts</Text>
          </View>
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
  const [newPassword, setnewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [image, setImage] = useState(null);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [editImage, setEditImage] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedOption, setSelectedOption] = useState('all'); // Initial selected option value, can be 'all' or 'contacts'
  const [limit, setLimit] = useState(10);
  const [offset, setoffset] = useState(0);


  const cameraRef = useRef(null);

  let stoken = "";
  let auserId = "";
  let pwd = "";
  const fetchData = async () => {
    try {
      stoken = await AsyncStorage.getItem('stoken');
      auserId = await AsyncStorage.getItem('userId');
      pwd = await AsyncStorage.getItem('pwd');
      // Do something with stoken
      console.log("this tok: " + auserId);
    } catch (error) {
      console.log("retrieve)) : " + error);
    }
  };

  const fetchPhoto = async () => {
    try {
      // Send a GET request to retrieve user photo
      const response = await fetch(`${URLaddress}/user/${auserId}/photo`, {
        headers: { 'X-Authorization': stoken, 'Accept': 'image/png' },
      });
      const resBlob = await response.blob(); // extract the response blob from the response object

      // create a URL for the blob data
      const data = URL.createObjectURL(resBlob);

      // update the state variables with the photo and isLoading flag
      setImageUri(data);
    } catch (err) {
      console.log(err);
    }
  };


  useEffect(() => {
    if (errorMessage) {
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    }
  }, [errorMessage]);

  useEffect(() => {
    const fetchDataAndUserInfo = async () => {
      try {
        await fetchData(); // Wait for fetchData() to complete
        console.log("this is id " + auserId);
        const data = await getUserInfo(auserId); // Wait for getUserInfo() to complete
        await fetchPhoto(); // invoke the fetchPhoto and wait
        setName(data.first_name);
        setSurname(data.last_name);
        setEmail(data.email);
        setnewPassword(pwd);
      } catch (error) {
        console.error('Error getting user info: ', error);
      }
    };

    fetchDataAndUserInfo();
  }, []);



  const handleValidation = () => {
    if (!name.trim() || !surname.trim() || !email.trim() || !newPassword.trim()) {
      setErrorMessage('Please fill all fields.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex for email validation
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    // Password validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*[@$!%*?&])(?=.*[0-9])[A-Za-z\d@$!%*?&]{8,}$/; // Regex for password validation
    if (!passwordRegex.test(newPassword.trim())) {
      setErrorMessage('Password must be at least 8 characters long and contain at least 1 uppercase letter and 1 special character.');
      return;
    }

    setShowInput(true);
  }


  const handleUpdateProfile = async () => {
    pwd = await AsyncStorage.getItem('pwd');
    auserId = await AsyncStorage.getItem('userId');
    if (!currentPassword.trim()) {
      setErrorMessage('Please enter a Valid Password.');
      return;
    } else if (currentPassword !== pwd) {
      setErrorMessage('Wrong Password.');
      return;
    }

    setShowInput(false);

    // retrieve current user info
    const currentUserInfo = await getUserInfo(auserId);

    // create new user info object with updated fields
    const updatedUserInfo = {
      first_name: name,
      last_name: surname,
      email: email,
    };

    if (newPassword !== currentPassword) {
      updatedUserInfo.password = newPassword;
    }

    // compare current and updated user info
    const updatedFields = {};
    Object.keys(updatedUserInfo).forEach(key => {
      if (currentUserInfo[key] !== updatedUserInfo[key]) {
        updatedFields[key] = updatedUserInfo[key];
      }
      setCurrentPassword('');
    });

    // patch only the fields that have changed
    if (Object.keys(updatedFields).length > 0) {
      await patchUserInfo(updatedFields);
      await AsyncStorage.setItem('pwd', newPassword);
    }

    // set showUpdate to false to hide the update form
    setShowUpdate(false);
  };

  const handleEditProfile = () => {
    setShowUpdate(true);
  };

  const navigation = useNavigation();

  const handleLogout = async () => { // Add async keyword here
    // navigate the user back to the sign-in screen
    await postLogout();
    navigation.navigate('SignIn');
  };

  const handleEditImage = () => {
    navigation.navigate('Camera');
  }

  const handleCancelPress = () => {
    setShowUpdate(false);
  };

  const searchUser = async (query) => {
    try {
      await fetchData(); // Retrieve stoken value
      const response = await fetch(`${URLaddress}/search?q=${query}&search_in=${selectedOption}&limit=${limit}&offset=${offset}`, {
        headers: {
          'X-Authorization': stoken, // Use stoken retrieved from AsyncStorage
        },
      });
      const result = await response.json();
      setResults(result);
    } catch (error) {
      console.error(error);
    }
  };



  const tableHead = ['ID', 'First Name', 'Last Name', 'Email'];

  const tableData = results.map((user) => [
    user.user_id.toString(),
    user.given_name,
    user.family_name,
    user.email,
  ]);

  return (
    <View style={styles.tabContent}>
      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}

      <View style={styles.profileImageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.profileImage} />
        ) : (
          <FontAwesome name="user" size={100} color="#555" />
        )}
        <TouchableOpacity style={styles.editImageButton} onPress={handleEditImage}>
          <Text style={styles.editImageButtonText}>Edit Image</Text>
        </TouchableOpacity>
      </View>


      {showUpdate ? (
        <View style={styles.profileInfo}>
          <TextInput
            style={styles.inputProfile}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.inputProfile}
            placeholder="Surname"
            value={surname}
            onChangeText={setSurname}
          />
          <TextInput
            style={styles.inputProfile}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.inputProfile}
            placeholder="Enter new Password"
            secureTextEntry={true}
            value={newPassword}
            onChangeText={setnewPassword}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.editButton} onPress={handleValidation}>
              <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleCancelPress}>
              <Text style={styles.logoutButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.profileViewContainer}>
          <View style={styles.profileInfoMain}>
            <Text style={styles.profileText}>
              {`${name} ${surname}`}
              <Text>{'\n'}</Text>
              {`${email}`}
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
              <FontAwesome name="pencil" style={styles.editButtonIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={() => handleLogout()}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {showInput ? (
        <>
          <TouchableOpacity style={styles.overlay} onPress={() => setShowInput(false)} />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputProfile}
              placeholder="Validate Current Password"
              secureTextEntry={true}
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <></>
      )}

      <View style={styles.searchfeaturecontainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.inputProfile}
            placeholder="Search for a user"
            onChangeText={setQuery}
          />
          <TouchableOpacity onPress={() => searchUser(query)} style={styles.searchButton}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.dropdownContainer}>
          <Picker
            selectedValue={selectedOption}
            onValueChange={(itemValue, itemIndex) => setSelectedOption(itemValue)}
            style={styles.dropdown}
          >
            <Picker.Item label="All" value="all" />
            <Picker.Item label="Contacts" value="contacts" />
          </Picker>
        </View>
        <View style={styles.limitContainer}>
          <Text style={styles.limitLabel}>Limit: {' '}
            <TextInput
              style={styles.limitInput}
              keyboardType="numeric"
              value={limit ? limit.toString() : ''}
              onChangeText={(text) => {
                // Check if input is empty
                if (text === '') {
                  // If empty, set the limit state to null
                  setLimit(null);
                } else {
                  // If not empty and is a valid number, set the limit state to the input value
                  if (!isNaN(text)) {
                    setLimit(parseInt(text));
                  }
                }
              }}
            />
          </Text>
          <Text style={styles.limitLabel}>Offset: {' '}
            <TextInput
              style={styles.limitInput}
              keyboardType="numeric"
              value={offset ? offset.toString() : ''}
              onChangeText={(text) => {
                // Check if input is empty
                if (text === '') {
                  // If empty, set the limit state to null
                  setoffset(null);
                } else {
                  // If not empty and is a valid number, set the limit state to the input value
                  if (!isNaN(text)) {
                    setoffset(parseInt(text));
                  }
                }
              }}
            />
          </Text>
        </View>
        {results.length > 0 && (
          <View style={styles.resultsContainer}>
            <Table borderStyle={{ borderWidth: 1 }}>
              <Row data={tableHead} style={styles.head} textStyle={styles.text} />
              {tableData.map((rowData, index) => (
                <Row key={index} data={rowData} style={[styles.row, index % 2 && { backgroundColor: '#F7F6E7' }]} textStyle={styles.text} />
              ))}
            </Table>
          </View>
        )}
      </View>
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
  errorBanner: {
    position: 'absolute',
    backgroundColor: 'red',
    marginTop: 20,
    padding: 10,
    zIndex: 999,
    borderRadius: 10,
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
    flexDirection: 'column',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  updateButtonProfile: {
    backgroundColor: 'transparent',
    height: 30,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  updateButtonIcon: {
    color: 'blue',
    fontSize: 18,
  },
  updateButtonText: {
    color: 'Red',
    flex: 1,
  },
  profileViewContainer: {
    flexDirection: 'column',
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
  editButton: {
    backgroundColor: '#ffcc00',
    borderRadius: 10,
    padding: 10,
    margin: 5,
  },
  editButtonIcon: {
    color: '#ffffff',
    fontSize: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: '#ff0000',
    borderRadius: 10,
    padding: 10,
    margin: 5,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
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
  searchfeaturecontainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    width: '100%'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    width: '90%'
  },
  searchButton: {
    height: 48,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    marginLeft: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdown: {
    height: 40,
    width: 150,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 8,
  },
  resultsContainer: {
    marginTop: 16,
  },
  head: { height: 40, backgroundColor: '#f1f8ff' },
  row: { height: 'auto' },
  text: { margin: 6 },

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
  blockedHeaderContainer: {
    backgroundColor: '#f67280',
    alignItems: 'center',
    width: '100%',
    padding: 10,
  },
  unblockedHeaderContainer: {
    backgroundColor: '#b3e6d1',
    alignItems: 'center',
    width: '100%',
    padding: 10,
  },
  contactHeaderText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
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
    zIndex: 100,
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
    zIndex: 101,
  },
  saveButton: {
    backgroundColor: '#3366FF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
    zIndex: 102,
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
});