import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Picker } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { URLaddress, loggedUser } from './App'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getContacts, postContact, deleteContact, getBlockedContacts, postBlockContact, deleteBlockedContact } from './ContactRequests'
import { FontAwesome } from '@expo/vector-icons'
import { getUserInfo, patchUserInfo, postLogout } from './UserRequests'
import { getChats, postChat, patchChat } from './ChatRequests'
import PropTypes from 'prop-types'

// Error banner appears on top of screen
const ErrorBanner = ({ message }) => {
  return (
    <View style={styles.errorBanner}>
      <Text style={{ color: 'white', fontWeight: 'bold' }}>{message}</Text>
    </View>
  )
}

ErrorBanner.propTypes = {
  message: PropTypes.string.isRequired
}

// Define Chats component
function Chats () {
  const navigation = useNavigation()
  const [chats, setChats] = useState([])
  const [showInput, setShowInput] = useState(false)
  const [chatName, setChatName] = useState('')
  const [editChatId, setEditChatId] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    getChats([chats, setChats])
  }, [])

  useEffect(() => {
    if (errorMessage) {
      setTimeout(() => {
        setErrorMessage('')
      }, 3000)
    }
  }, [errorMessage])

  // Show input to create a new chat
  const handleAddChat = () => {
    setShowInput(true)
  }

  // Post request to create new chat
  const handleCreateChat = () => {
    if (!chatName.trim()) {
      setErrorMessage('Please enter a valid chat name.')
      return
    }
    postChat(chatName)
      .then(() => {
        setShowInput(false)
        setChatName('')
        getChats([chats, setChats])
      })
      .catch(error => {
        console.error('Error creating chat: ', error)
      })
  }

  // Changing chat name
  const handleEditChat = (chatId) => {
    setEditChatId(chatId)
    setShowInput(true)
  }

  // Saving new chat name
  const handleSaveEdit = () => {
    if (!chatName.trim()) {
      setErrorMessage('Please enter a valid chat name.')
      return
    }
    patchChat(editChatId, chatName)
      .then(() => {
        setShowInput(false)
        setEditChatId(null)
        setChatName('')
        getChats([chats, setChats])
      })
      .catch(error => {
        console.error('Error editing chat: ', error)
      })
  }

  const handleChatPress = (chatId) => {
    navigation.navigate('Chat', { chatId, loggedUser })
  }

  return (
    <View style={styles.tabContent}>
      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
      {chats.map(chat => (
        <TouchableOpacity key={chat.chat_id} style={styles.homeItem} onPress={() => handleChatPress(chat.chat_id)}>
          <View style={styles.homeItemView}>
            <Text style={styles.homeItemName}>{chat.name}</Text>
            <TouchableOpacity style={styles.homeItemIcons} onPress={() => handleEditChat(chat.chat_id)}>
              <FontAwesome name='edit' size={20} color='#000' />
            </TouchableOpacity>
          </View>
          <Text style={styles.chatLastMessage}>
            {chat.last_message && Object.keys(chat.last_message).length !== 0
              ? chat.last_message.message || 'No messages yet'
              : 'No messages yet'}
          </Text>
        </TouchableOpacity>
      ))}
      {showInput
        ? (
          <>
            <TouchableOpacity style={styles.overlay} onPress={() => setShowInput(false)} />
            <View style={styles.inputContainerParent}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder='Chat name'
                  value={chatName}
                  onChangeText={setChatName}
                />
                <TouchableOpacity style={styles.saveButton} onPress={editChatId ? handleSaveEdit : handleCreateChat}>
                  <Text style={styles.saveButtonText}>{editChatId ? 'Save' : 'Create'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
          )
        : (
          <TouchableOpacity style={styles.newItemButton} onPress={handleAddChat}>
            <FontAwesome name='comment' size={20} color='#FFF' />
          </TouchableOpacity>
          )}
    </View>
  )
}

// Define Contacts component
function Contacts () {
  const [contacts, setContacts] = useState([])
  const [blockedcontacts, setBlockedContacts] = useState([])
  const [showInput, setShowInput] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selectedOption, setSelectedOption] = useState('all') // Initial selected option value, can be 'all' or 'contacts'
  const [limit, setLimit] = useState(10)
  const [offset, setoffset] = useState(0)

  useEffect(() => {
    getContacts([contacts, setContacts])
    getBlockedContacts([blockedcontacts, setBlockedContacts])
  }, [])

  useEffect(() => {
    if (errorMessage) {
      setTimeout(() => {
        setErrorMessage('')
      }, 3000)
    }
  }, [errorMessage])

  // Show search to add new contact
  const handleAddContact = () => {
    setShowInput(true)
  }

  // Saving new contact
  const handleSaveContact = (uid) => {
    // call API to save the contact with the provided user ID
    postContact(uid)
      .then(() => {
        setShowInput(false)
        // call getContacts to update the contacts list with the new contact
        getContacts([contacts, setContacts])
      })
      .catch(error => {
        console.error('Error saving contact: ', error)
      })
  }

  // Delete contact
  const handleDeleteContact = (contactId) => {
    deleteContact(contactId)
      .then(() => {
        // filter out the deleted contact from the contacts list
        setContacts(contacts.filter(contact => contact.user_id !== contactId))
      })
      .catch(error => {
        console.error('Error deleting contact: ', error)
      })
  }

  // Block contact
  const handleBlockContact = (contactId) => {
    // call API to block the contact with the given ID
    postBlockContact(contactId)
      .then(() => {
        // call getContacts to update the contacts list with the new contact
        getContacts([contacts, setContacts])
        getBlockedContacts([blockedcontacts, setBlockedContacts])
      })
      .catch(error => {
        console.error('Error blocking contact: ', error)
      })
  }

  // Unblock contact
  const handleUnblockContact = (contactId) => {
    deleteBlockedContact(contactId)
      .then(() => {
        // call getContacts to update the contacts list with the new contact
        getContacts([contacts, setContacts])
        getBlockedContacts([blockedcontacts, setBlockedContacts])
      })
      .catch(error => {
        console.error('Error blocking contact: ', error)
      })
  }

  let stoken = ''
  let auserId = ''

  const fetchData = async () => {
    try {
      stoken = await AsyncStorage.getItem('stoken')
      auserId = await AsyncStorage.getItem('userId')
      console.log('this tok: ' + auserId)
    } catch (error) {
      console.log(error)
    }
  }

  // Searching
  const searchUser = async (query) => {
    try {
      await fetchData() // Retrieve stoken value
      const response = await fetch(`${URLaddress}/search?q=${query}&search_in=${selectedOption}&limit=${limit}&offset=${offset}`, {
        headers: {
          'X-Authorization': stoken // Use stoken retrieved from AsyncStorage
        }
      })
      const result = await response.json()
      for (let i = 0; i < result.length; i++) {
        const auserId = result[i].user_id
        try {
          const photoResponse = await fetch(`${URLaddress}/user/${auserId}/photo`, {
            headers: { 'X-Authorization': stoken, Accept: 'image/png' }
          })
          const photoBlob = await photoResponse.blob()
          const photoURL = URL.createObjectURL(photoBlob)

          // Add the photo URL to the contact object
          result[i].photoSource = photoURL
        } catch (photoErr) {
          console.error('Error fetching photo:', photoErr)
        }
      }
      setResults(result)
    } catch (error) {
      console.error(error)
    }
  }

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
                <Image source={contact.photoSource} style={styles.homeItemPhoto} />
                <Text style={styles.homeItemName}>{contact.first_name} {contact.last_name}</Text>
                <TouchableOpacity style={styles.homeItemIcons} onPress={() => handleDeleteContact(contact.user_id)}>
                  <FontAwesome name='trash-o' size={20} color='#FF0000' />
                </TouchableOpacity>

                <TouchableOpacity style={styles.homeItemIcons} onPress={() => handleBlockContact(contact.user_id)}>
                  <FontAwesome name='unlock-alt' size={20} color='#000000' />
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
                <Image source={contact.photoSource} style={styles.homeItemPhoto} />
                <Text style={styles.homeItemName}>{contact.first_name} {contact.last_name}</Text>
                <TouchableOpacity style={styles.homeItemIcons} onPress={() => handleDeleteContact(contact.user_id)}>
                  <FontAwesome name='trash-o' size={20} color='#FF0000' />
                </TouchableOpacity>

                <TouchableOpacity style={styles.homeItemIcons} onPress={() => handleUnblockContact(contact.user_id)}>
                  <FontAwesome name='lock' size={20} color='#000000' />
                </TouchableOpacity>

              </View>
              {index !== blockedcontacts.length - 1 && <View style={styles.separator} />}
            </View>
          ))}
        </>
      )}
      {showInput
        ? (
          <>
            <TouchableOpacity style={styles.overlay} onPress={() => setShowInput(false)} />
            <View style={styles.inputContainerParent}>
              <View style={styles.inputContainer}>
                <View style={styles.searchfeaturecontainer}>
                  <View style={styles.searchContainer}>
                    <TextInput
                      style={styles.inputProfile}
                      placeholder='Search for a user'
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
                      <Picker.Item label='All' value='all' />
                      <Picker.Item label='Contacts' value='contacts' />
                    </Picker>
                  </View>
                  <View style={styles.limitContainer}>
                    <Text style={styles.limitLabel}>Limit: {' '}
                      <TextInput
                        style={styles.limitInput}
                        keyboardType='numeric'
                        value={limit ? limit.toString() : ''}
                        onChangeText={(text) => {
                          // Check if input is empty
                          if (text === '') {
                            // If empty, set the limit state to null
                            setLimit(null)
                          } else {
                            // If not empty and is a valid number, set the limit state to the input value
                            if (!isNaN(text)) {
                              setLimit(parseInt(text))
                            }
                          }
                        }}
                      />
                    </Text>
                    <Text style={styles.limitLabel}>Offset: {' '}
                      <TextInput
                        style={styles.limitInput}
                        keyboardType='numeric'
                        value={offset ? offset.toString() : ''}
                        onChangeText={(text) => {
                          // Check if input is empty
                          if (text === '') {
                            // If empty, set the limit state to null
                            setoffset(null)
                          } else {
                            // If not empty and is a valid number, set the limit state to the input value
                            if (!isNaN(text)) {
                              setoffset(parseInt(text))
                            }
                          }
                        }}
                      />
                    </Text>
                  </View>
                  {results.length > 0 && (
                    <ScrollView>
                      <View style={styles.resultsContainer}>
                        {results.map((user) => (
                          <View key={user.user_id} style={styles.homeItem}>
                            <View style={styles.homeItemView}>
                              <Image source={user.photoSource} style={styles.homeItemPhoto} />
                              <Text style={styles.homeItemName}>{user.given_name} {user.family_name}</Text>
                              <TouchableOpacity style={styles.homeItemButton} onPress={() => handleSaveContact(user.user_id)}>
                                <FontAwesome name='plus' size={20} color='white' />
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                      </View>
                    </ScrollView>
                  )}
                </View>
              </View>
            </View>
          </>
          )
        : (
          <TouchableOpacity style={styles.newItemButton} onPress={handleAddContact}>
            <FontAwesome name='user-plus' size={20} color='#FFF' />
          </TouchableOpacity>
          )}
    </View>
  )
}

function Profile () {
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [email, setEmail] = useState('')
  const [newPassword, setnewPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [showUpdate, setShowUpdate] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [imageUri, setImageUri] = useState(null)
  const navigation = useNavigation()

  // storing async data in local variables
  let stoken = ''
  let auserId = ''
  let pwd = ''
  const fetchData = async () => {
    try {
      stoken = await AsyncStorage.getItem('stoken')
      auserId = await AsyncStorage.getItem('userId')
      pwd = await AsyncStorage.getItem('pwd')
      console.log('this tok: ' + auserId)
    } catch (error) {
      console.log(error)
    }
  }

  // GET profile photo function
  const fetchPhoto = async () => {
    try {
      // Send a GET request to retrieve user photo
      const response = await fetch(`${URLaddress}/user/${auserId}/photo`, {
        headers: { 'X-Authorization': stoken, Accept: 'image/png' }
      })
      const resBlob = await response.blob() // extract the response blob from the response object

      // create a URL for the blob data
      const data = URL.createObjectURL(resBlob)
      setImageUri(data)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    if (errorMessage) {
      setTimeout(() => {
        setErrorMessage('')
      }, 3000)
    }
  }, [errorMessage])

  // Fetch user info and photo onLoad
  useEffect(() => {
    const fetchDataAndUserInfo = async () => {
      try {
        await fetchData() // Wait for fetchData() to complete
        console.log('this is id ' + auserId)
        const data = await getUserInfo(auserId) // Wait for getUserInfo() to complete
        await fetchPhoto() // invoke the fetchPhoto and wait
        setName(data.first_name)
        setSurname(data.last_name)
        setEmail(data.email)
        setnewPassword(pwd)
      } catch (error) {
        console.error('Error getting user info: ', error)
      }
    }

    fetchDataAndUserInfo()
  }, [])

  // Event listener, fetch profile photo when navigating to profile
  useEffect(() => {
    const updatePhoto = navigation.addListener('focus', () => {
      fetchPhoto()
    })

    return updatePhoto
  }, [navigation])

  const handleValidation = () => {
    if (!name.trim() || !surname.trim() || !email.trim() || !newPassword.trim()) {
      setErrorMessage('Please fill all fields.')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Regex for email validation
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    // Password validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*[@$!%*?&])(?=.*[0-9])[A-Za-z\d@$!%*?&]{8,}$/ // Regex for password validation
    if (!passwordRegex.test(newPassword.trim())) {
      setErrorMessage('Password must be at least 8 characters long and contain at least 1 uppercase letter and 1 special character.')
      return
    }

    setShowInput(true)
  }

  // Called when user wants to save edited profile inforation
  const handleUpdateProfile = async () => {
    pwd = await AsyncStorage.getItem('pwd')
    auserId = await AsyncStorage.getItem('userId')
    //  Confirming user identity
    if (!currentPassword.trim()) {
      setErrorMessage('Please enter a Valid Password.')
      return
    } else if (currentPassword !== pwd) {
      setErrorMessage('Wrong Password.')
      return
    }

    setShowInput(false)

    // retrieve current user info
    const currentUserInfo = await getUserInfo(auserId)

    // create new user info object with updated fields
    const updatedUserInfo = {
      first_name: name,
      last_name: surname,
      email
    }

    if (newPassword !== currentPassword) {
      updatedUserInfo.password = newPassword
    }

    // compare current and updated user info
    const updatedFields = {}
    Object.keys(updatedUserInfo).forEach(key => {
      if (currentUserInfo[key] !== updatedUserInfo[key]) {
        updatedFields[key] = updatedUserInfo[key]
      }
      setCurrentPassword('')
    })

    // patch only the fields that have changed
    if (Object.keys(updatedFields).length > 0) {
      await patchUserInfo(updatedFields)
      await AsyncStorage.setItem('pwd', newPassword)
    }

    // set showUpdate to false to hide the update form
    setShowUpdate(false)
  }

  // Show input boxes to make changes to profile info
  const handleEditProfile = () => {
    setShowUpdate(true)
  }

  // Log out function
  const handleLogout = async () => {
    // navigate the user back to the sign-in screen
    await postLogout()
    navigation.navigate('SignIn')
  }

  // Open camera to take new picture
  const handleEditImage = () => {
    navigation.navigate('Camera')
  }

  // Hide input boxes
  const handleCancelPress = () => {
    setShowUpdate(false)
  }

  return (
    <View style={styles.tabContent}>
      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}

      <View style={styles.profileImageContainer}>
        {imageUri
          ? (
            <Image source={{ uri: imageUri }} style={styles.profileImage} />
            )
          : (
            <FontAwesome name='user' size={100} color='#555' />
            )}
        <TouchableOpacity style={styles.editImageButton} onPress={handleEditImage}>
          <Text style={styles.editImageButtonText}>Edit Image</Text>
        </TouchableOpacity>
      </View>

      {showUpdate
        ? (
          <View style={styles.profileInfo}>
            <TextInput
              style={styles.inputProfile}
              placeholder='Name'
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.inputProfile}
              placeholder='Surname'
              value={surname}
              onChangeText={setSurname}
            />
            <TextInput
              style={styles.inputProfile}
              placeholder='Email'
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.inputProfile}
              placeholder='Enter new Password'
              secureTextEntry
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
          )
        : (
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
                <FontAwesome name='pencil' style={styles.editButtonIcon} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutButton} onPress={() => handleLogout()}>
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
          )}
      {showInput
        ? (
          <>
            <TouchableOpacity style={styles.overlay} onPress={() => setShowInput(false)} />
            <View style={styles.inputContainerParent}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.inputProfile}
                  placeholder='Validate Current Password'
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
                <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>)
        : (<></>)}
    </View>
  )
}

export default function Home () {
  const [activeTab, setActiveTab] = useState('Chats')

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Profile' && styles.activeTabButton]}
          onPress={() => setActiveTab('Profile')}
        >
          {activeTab === 'Profile'
            ? (
              <Text style={[styles.tabButtonText, styles.activeTabButtonText]}>Profile</Text>)
            : (
              <FontAwesome name='user-o' size={18} color='#fff' />)}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Chats' && styles.activeTabButton]}
          onPress={() => setActiveTab('Chats')}
        >
          {activeTab === 'Chats'
            ? (
              <Text style={[styles.tabButtonText, styles.activeTabButtonText]}>Chats</Text>
              )
            : (
              <FontAwesome name='comments' size={18} color='#fff' />
              )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Contacts' && styles.activeTabButton]}
          onPress={() => setActiveTab('Contacts')}
        >
          {activeTab === 'Contacts'
            ? (
              <Text style={[styles.tabButtonText, styles.activeTabButtonText]}>Contacts</Text>
              )
            : (
              <FontAwesome name='address-book-o' size={18} color='#fff' />
              )}
        </TouchableOpacity>
      </View>

      {/* Tab content */}
      {activeTab === 'Chats' ? <Chats /> : activeTab === 'Contacts' ? <Contacts /> : <Profile />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#007aff',
    height: 60
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  tabButtonContent: {
    paddingHorizontal: 10
  },
  tabButtonText: {
    color: '#fff',
    fontSize: 18
  },
  activeTabButton: {
    flex: 3,
    borderBottomWidth: 2,
    borderBottomColor: '#fff'
  },
  activeTabButtonText: {
    fontWeight: 'bold'
  },
  tabContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  errorBanner: {
    position: 'absolute',
    backgroundColor: 'red',
    marginTop: 20,
    padding: 10,
    zIndex: 999,
    borderRadius: 10
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20
  },
  profileImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50
  },
  editImageButton: {
    marginTop: 10
  },
  editImageButtonText: {
    color: 'blue'
  },
  hiddenInput: {
    display: 'none'
  },
  showUpdateButton: {
    marginTop: 10
  },
  showUpdateButtonText: {
    color: 'blue'
  },
  profileInfo: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 20
  },
  updateButtonProfile: {
    backgroundColor: 'transparent',
    height: 30,
    justifyContent: 'center',
    flexDirection: 'row'
  },
  updateButtonIcon: {
    color: 'blue',
    fontSize: 18
  },
  updateButtonText: {
    color: 'Red',
    flex: 1
  },
  profileViewContainer: {
    flexDirection: 'column'
  },
  profileInfoMain: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center'
  },
  profileText: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  editButton: {
    backgroundColor: '#ffcc00',
    borderRadius: 10,
    padding: 10,
    margin: 5
  },
  editButtonIcon: {
    color: '#ffffff',
    fontSize: 20,
    textAlign: 'center'
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10
  },
  logoutButton: {
    backgroundColor: '#ff0000',
    borderRadius: 10,
    padding: 10,
    margin: 5
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  changeImageButton: {
    backgroundColor: '#007aff',
    padding: 10,
    borderRadius: 5,
    marginTop: 10
  },
  changeImageButtonText: {
    color: '#fff',
    textAlign: 'center'
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
    justifyContent: 'center'
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  dropdownContainer: {
    marginBottom: 16
  },
  dropdown: {
    height: 40,
    width: 150,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 8
  },
  resultsContainer: {
    marginTop: 16,
    height: 400 // Set a fixed height
  },
  scrollViewContent: {
    flexGrow: 1, // Allow content to expand vertically
    paddingBottom: 20 // Add padding at the bottom to prevent content from being cut off
  },
  head: { height: 40, backgroundColor: '#f1f8ff' },
  row: { height: 'auto' },
  text: { margin: 6 },
  form: { width: '100%' },
  label: {
    fontWeight: 'bold',
    marginBottom: 5
  },
  submitButton: {
    backgroundColor: '#007aff',
    padding: 10,
    borderRadius: 5,
    marginTop: 20
  },
  submitButtonText: {
    color: '#fff',
    textAlign: 'center'
  },
  profileName: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 20
  },
  profileEmail: {
    color: '#777',
    fontSize: 14,
    marginTop: 5
  },
  inputProfile: {
    width: '70%',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5
  },
  homeItem: {
    width: '100%',
    padding: 20,
    backgroundColor: '#f0f0f0',
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  homeItemView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  homeItemName: {
    flex: 5,
    fontWeight: 'bold',
    fontSize: 16
  },
  homeItemPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10
  },
  homeItemButton: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10
  },
  homeItemIcons: {
    flex: 1
  },
  blockedHeaderContainer: {
    backgroundColor: '#f67280',
    alignItems: 'center',
    width: '100%',
    padding: 10
  },
  unblockedHeaderContainer: {
    backgroundColor: '#b3e6d1',
    alignItems: 'center',
    width: '100%',
    padding: 10
  },
  contactHeaderText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold'
  },
  chatLastMessage: {
    color: '#777',
    fontSize: 14
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
      height: 3
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,

    elevation: 7
  },
  newContactButtonText: {
    color: '#fff',
    fontSize: 32,
    lineHeight: 32
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 100
  },
  inputContainerParent: {
    flex: 1,
    left: '38%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 101
  },
  inputContainer: {
    position: 'absolute',
    transform: [{ translateX: -150 }, { translateY: -100 }],
    minWidth: 300,
    minHeight: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  saveButton: {
    backgroundColor: '#3366FF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
    zIndex: 102
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center'
  }
})
