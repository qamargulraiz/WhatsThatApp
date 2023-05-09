import { URLaddress } from './App'
import AsyncStorage from '@react-native-async-storage/async-storage'

export function getContacts ([contacts, setContacts]) {
  // Use an async function inside useEffect to fetch data
  async function fetchContacts () {
    const stoken = await AsyncStorage.getItem('stoken')
    try {
      const response = await fetch(URLaddress + '/contacts', {
        headers: { 'X-Authorization': stoken }
      })

      if (response.status === 200) {
        const data = await response.json()

        // Loop through each contact and fetch their photo
        for (let i = 0; i < data.length; i++) {
          const auserId = data[i].user_id
          try {
            const photoResponse = await fetch(`${URLaddress}/user/${auserId}/photo`, {
              headers: { 'X-Authorization': stoken, Accept: 'image/png' }
            })
            const photoBlob = await photoResponse.blob()
            const photoURL = URL.createObjectURL(photoBlob)

            // Add the photo URL to the contact object
            data[i].photoSource = photoURL
          } catch (photoErr) {
            console.error('Error fetching photo:', photoErr)
          }
        }

        // Update the state with the modified contact data
        setContacts(data)
      } else {
        console.error('Failed to retrieve contacts')
      }
    } catch (error) {
      console.error('Get Contact error:', error)
    }
  }

  fetchContacts()

  return contacts
}

export async function postContact (userId) {
  const stoken = await AsyncStorage.getItem('stoken')
  try {
    // Send a POST request with the user's signup data
    const response = await fetch(URLaddress + '/user/' + userId + '/contact', {
      method: 'POST',
      headers: { 'X-Authorization': stoken }
    })

    // Check the response status
    if (response.status === 200) {
      console.log('Contact Successfully Saved!')
    } else {
      console.error('Save failed.')
    }
  } catch (error) {
    console.error('Save failed:', error)
  }
};

export async function deleteContact (userId) {
  const stoken = await AsyncStorage.getItem('stoken')
  try {
    // Send a DELETE request with the user's signup data
    const response = await fetch(URLaddress + '/user/' + userId + '/contact', {
      method: 'DELETE',
      headers: { 'X-Authorization': stoken }
    })

    // Check the response status
    if (response.status === 200) {
      console.log('Contact Successfully deleted!')
    } else {
      console.error('Delete failed.')
    }
  } catch (error) {
    console.error('Delete failed:', error)
  }
};

export function getBlockedContacts ([blockedcontacts, setBlockedContacts]) {
  // Use an async function inside useEffect to fetch data
  async function fetchContacts () {
    const stoken = await AsyncStorage.getItem('stoken')
    try {
      // Send a GET request with the user's authorization token
      const response = await fetch(URLaddress + '/blocked', {
        headers: { 'X-Authorization': stoken }
      })

      // Check the response status
      if (response.status === 200) {
        const data = await response.json()

        // Loop through each contact and fetch their photo
        for (let i = 0; i < data.length; i++) {
          const auserId = data[i].user_id
          try {
            const photoResponse = await fetch(`${URLaddress}/user/${auserId}/photo`, {
              headers: { 'X-Authorization': stoken, Accept: 'image/png' }
            })
            const photoBlob = await photoResponse.blob()
            const photoURL = URL.createObjectURL(photoBlob)

            // Add the photo URL to the contact object
            data[i].photoSource = photoURL
          } catch (photoErr) {
            console.error('Error fetching photo:', photoErr)
          }
        }
        setBlockedContacts(data)
      } else {
        console.error('Failed to retrieve contacts')
      }
    } catch (error) {
      console.error('Get Block Contact error:', error)
    }
  }

  fetchContacts()

  return blockedcontacts
}

export async function postBlockContact (userId) {
  const stoken = await AsyncStorage.getItem('stoken')
  try {
    // Send a POST request with the user's signup data
    const response = await fetch(URLaddress + '/user/' + userId + '/block', {
      method: 'POST',
      headers: { 'X-Authorization': stoken }
    })

    // Check the response status
    if (response.status === 200) {
      console.log('Contact Successfully Blocked!')
    } else {
      console.error('Block contact failed.')
    }
  } catch (error) {
    console.error('Block contact failed:', error)
  }
};

export async function deleteBlockedContact (userId) {
  const stoken = await AsyncStorage.getItem('stoken')
  try {
    // Send a DELETE request with the user's signup data
    const response = await fetch(URLaddress + '/user/' + userId + '/block', {
      method: 'DELETE',
      headers: { 'X-Authorization': stoken }
    })

    // Check the response status
    if (response.status === 200) {
      console.log('Contact Successfully unblocked!')
    } else {
      console.error('unblock failed.')
    }
  } catch (error) {
    console.error('unblock failed:', error)
  }
};
