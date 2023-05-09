import { URLaddress } from './App'
import AsyncStorage from '@react-native-async-storage/async-storage'

export async function postSignUp (firstname, lastname, email, password) {
  try {
    // Send a POST request with the user's signup data
    const response = await fetch(URLaddress + '/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_name: firstname, last_name: lastname, email, password })
    })

    console.log(response.status)

    // Return the response object
    return response
  } catch (error) {
    console.error('Sign up failed:', error)
  }
}

export async function getUserInfo (userId) {
  const stoken = await AsyncStorage.getItem('stoken')
  try {
    // Send a GET request with the user's authorization token
    const response = await fetch(URLaddress + '/user/' + userId, {
      headers: { 'X-Authorization': stoken }
    })

    // Check the response status
    if (response.status === 200) {
      // Store the JSON response in a constant and set state
      const data = await response.json()
      return data
    } else {
      console.error('Failed to retrieve user info')
    }
  } catch (error) {
    console.error('Get user info error:', error)
  }
}

export async function patchUserInfo (patchBody) {
  const stoken = await AsyncStorage.getItem('stoken')
  const auserId = await AsyncStorage.getItem('userId')
  let pwd = await AsyncStorage.getItem('pwd')
  try {
    // Send a PATCH request with the user's signup data
    const response = await fetch(URLaddress + '/user/' + auserId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-Authorization': stoken },
      body: JSON.stringify(patchBody)
    })

    console.log(response.status)

    // Check the response status
    if (response.status === 200) {
      console.log('Sign up successful!')
      if (patchBody.password) {
        pwd = patchBody.password
        console.log('New Password is:' + pwd)
      }
    } else {
      console.error('Sign up failed.')
    }
  } catch (error) {
    console.error('Sign up failed:', error)
  }
}

export async function postLogout () {
  const stoken = await AsyncStorage.getItem('stoken')
  try {
    // Send a POST request with token for logout
    const response = await fetch(URLaddress + '/logout', {
      method: 'POST',
      headers: { 'X-Authorization': stoken }
    })

    console.log(response.status)

    // Check the response status
    if (response.status === 200) {
      console.log('Logout successful!')
      try {
        await AsyncStorage.removeItem('stoken')
        await AsyncStorage.removeItem('userId')
        await AsyncStorage.removeItem('pwd')
      } catch (error) {
        console.error(`Error removing item from AsyncStorage: ${error}`)
      }
    } else {
      console.error('Logout failed.')
    }
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
