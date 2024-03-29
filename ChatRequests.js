import { URLaddress } from './App'
import AsyncStorage from '@react-native-async-storage/async-storage'

export function getChats ([chats, setChats]) {
  // Use an async function inside useEffect to fetch data
  async function fetchChats () {
    const stoken = await AsyncStorage.getItem('stoken')
    try {
      // Send a GET request with the user's authorization token
      const response = await fetch(URLaddress + '/chat', {
        headers: { 'X-Authorization': stoken }
      })

      // Check the response status
      if (response.status === 200) {
        // Store the JSON response in a constant and set state
        const data = await response.json()
        console.log('data received: ' + data)
        setChats([])
        setChats(data)
      } else {
        console.error('Failed to retrieve chats')
      }
    } catch (error) {
      console.error('Get Chats error:', error)
    }
  }

  fetchChats()

  return chats
}

export async function postChat (chatName) {
  const stoken = await AsyncStorage.getItem('stoken')
  try {
    // Send a POST request with the user's signup data
    const response = await fetch(URLaddress + '/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Authorization': stoken },
      body: JSON.stringify({ name: chatName })
    })

    // Check the response status
    if (response.status === 201) {
      console.log('Chat Successfully Created!')
    } else {
      console.error('Chat creation failed.')
    }
  } catch (error) {
    console.error('chat creation failed:', error)
  }
};

export async function patchChat (editChatId, chatName) {
  const stoken = await AsyncStorage.getItem('stoken')
  try {
    // Send a PATCH request with the user's signup data
    const response = await fetch(URLaddress + '/chat/' + editChatId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-Authorization': stoken },
      body: JSON.stringify({ name: chatName })
    })

    // Check the response status
    if (response.status === 200) {
      console.log('Chat Name Successfully Updated!')
    } else {
      console.error('Chat name update failed.')
    }
  } catch (error) {
    console.error('chat name update failed:', error)
  }
};

export async function getChatById (setChat, chatId) {
  const stoken = await AsyncStorage.getItem('stoken')
  try {
    // Send a GET request with the user's authorization token
    const response = await fetch(`${URLaddress}/chat/${chatId}`, {
      headers: { 'X-Authorization': stoken }
    })

    // Check the response status
    if (response.status === 200) {
      // Store the JSON response in a constant and set state
      const data = await response.json()
      console.log('data received: ' + data)
      setChat(data)
      return data
    } else {
      console.error('Failed to retrieve chat details')
    }
  } catch (error) {
    console.error('Get ChatById error:', error)
  }
  return null
}

export async function postMessage (chatId, chatMessage) {
  const stoken = await AsyncStorage.getItem('stoken')
  const chatMsg = chatMessage + ' '
  try {
    // Send a POST request with the user's signup data
    const response = await fetch(URLaddress + '/chat/' + chatId + '/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Authorization': stoken },
      body: JSON.stringify({ message: chatMsg })
    })

    // Check the response status
    if (response.status === 200) {
      console.log('Message Successfully Sent!')
    } else {
      console.error('Sending Message failed.')
    }
  } catch (error) {
    console.error('sending message failed:', error)
  }
};

export async function postAddMember (chatId, userId) {
  const stoken = await AsyncStorage.getItem('stoken')
  try {
    // Send a POST request with the user's signup data
    const response = await fetch(URLaddress + '/chat/' + chatId + '/user/' + userId, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Authorization': stoken }
    })

    // Check the response status
    if (response.status === 200) {
      console.log('Adding member success!')
    } else {
      console.error('Adding member failed.')
    }
  } catch (error) {
    console.error('Adding member failed:', error)
  }
};

export async function deleteChatMember (chatId, memberId) {
  const stoken = await AsyncStorage.getItem('stoken')
  try {
    // Send a POST request with the user's signup data
    const response = await fetch(URLaddress + '/chat/' + chatId + '/user/' + memberId, {
      method: 'DELETE',
      headers: { 'X-Authorization': stoken }
    })

    // Check the response status
    if (response.status === 200) {
      console.log('Delete member success!')
    } else {
      console.error('Delete member failed.')
    }
  } catch (error) {
    console.error('Delete member failed:', error)
  }
};

export async function patchMessage (chatId, message, messageId) {
  const stoken = await AsyncStorage.getItem('stoken')
  const chatMsg = message + ' '
  try {
    // Send a POST request with the user's signup data
    const response = await fetch(URLaddress + '/chat/' + chatId + '/message/' + messageId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-Authorization': stoken },
      body: JSON.stringify({ message: chatMsg })
    })

    // Check the response status
    if (response.status === 200) {
      console.log('Adding member success!')
    } else {
      console.error('Adding member failed.')
    }
  } catch (error) {
    console.error('Adding member failed:', error)
  }
};

export async function deleteMessage (chatId, messageId) {
  const stoken = await AsyncStorage.getItem('stoken')
  try {
    // Send a POST request with the user's signup data
    const response = await fetch(URLaddress + '/chat/' + chatId + '/message/' + messageId, {
      method: 'DELETE',
      headers: { 'X-Authorization': stoken }
    })

    // Check the response status
    if (response.status === 200) {
      console.log('Delete message success!')
    } else {
      console.error('Delete message failed.')
    }
  } catch (error) {
    console.error('Delete message failed:', error)
  }
};
