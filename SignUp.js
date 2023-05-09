import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { postSignUp } from './UserRequests'
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

SignUp.propTypes = {
  navigation: PropTypes.object.isRequired
}

export default function SignUp ({ navigation }) {
  const [firstname, setFirstName] = useState('')
  const [lastname, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (errorMessage) {
      setTimeout(() => {
        setErrorMessage('')
      }, 3000)
    }
  }, [errorMessage])

  const handleSignUp = async () => {
    // Perform validation
    if (!firstname || !lastname || !email || !password || !confirmPassword) {
      setErrorMessage('All fields are required')
      return
    }

    if (!validateEmail(email)) {
      setErrorMessage('Invalid email format')
      return
    }

    if (password.length < 8 || !validatePasswordStrength(password)) {
      setErrorMessage(
        'Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character'
      )
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match')
      return
    }

    // If all validation checks pass, proceed with sign-up logic
    console.log(`{
      "first_name": "${firstname}",
      "last_name": "${lastname}",
      "email": "${email}",
      "password": "${password}"
    }`)

    postSignUp(firstname, lastname, email, password)
      .then(response => {
        // Check if response is successful (status code 201)
        if (response.status === 201) {
          // Navigate to SignIn screen
          navigation.navigate('SignIn')
        } else {
          // Parse response body as JSON
          response.text()
            .then(data => {
              // Extract error message from plain text data
              const errorMessage = data || 'Sign up failed. Please try again.'

              // Display error banner
              setErrorMessage(errorMessage)
            })
            .catch(
              // Display error banner
              setErrorMessage('Sign up failed. Please try again.')
            )
        }
      })
      .catch(
        // Display error banner
        setErrorMessage('Sign up failed. Please try again.')
      )
  }

  const handleSignIn = () => {
    // Implement your navigation logic to the sign-in page here
    navigation.navigate('SignIn')
  }

  // Helper function to validate email format
  const validateEmail = (email) => {
    // Regular expression for email format validation
    const emailRegex = /\S+@\S+\.\S+/
    return emailRegex.test(email)
  }

  // Helper function to validate password strength
  const validatePasswordStrength = (password) => {
    // Regular expressions for password strength validation
    const uppercaseRegex = /[A-Z]/
    const numberRegex = /[0-9]/
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/
    return (
      uppercaseRegex.test(password) &&
      numberRegex.test(password) &&
      specialCharRegex.test(password)
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Sign Up</Text>
      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
      <TextInput
        style={styles.input}
        placeholder='First Name'
        value={firstname}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder='Last Name'
        value={lastname}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder='Email'
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder='Password'
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder='Confirm Password'
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Already have an account? </Text>
        <TouchableOpacity onPress={handleSignIn}>
          <Text style={[styles.signupText, styles.signupLink]}>Sign in here</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24
  },
  input: {
    width: '80%',
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8
  },
  button: {
    backgroundColor: '#007aff',
    padding: 16,
    borderRadius: 8
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 16
  },
  signupText: {
    color: '#333'
  },
  signupLink: {
    color: '#007aff'
  },
  errorBanner: {
    position: 'absolute',
    top: 0, // Set top to 0 to position the error banner at the top of the screen
    backgroundColor: 'red',
    marginTop: 20,
    padding: 10,
    zIndex: 999,
    borderRadius: 10,
    textAlign: 'center'
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center'
  }
})
