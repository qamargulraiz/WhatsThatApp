import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { URLaddress, loggedUser } from './App';

const ErrorBanner = ({ message }) => {
  return (
    <View style={styles.errorBanner}>
      <Text style={{ color: 'white', fontWeight: 'bold' }}>{message}</Text>
    </View>
  );
};

export default function SignIn({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const checkUserIdAndNavigate = async () => {
      try {
        // Retrieve userId from AsyncStorage
        const userId = await AsyncStorage.getItem('userId');
  
        if (userId && userId !== '') {
          // userId exists and is not empty, navigate to Home screen
          loggedUser.userId=userId;
          navigation.navigate('Home');
        }
      } catch (error) {
        console.log(error);
      }
    }
  
    checkUserIdAndNavigate(); // Invoke the function to check userId and navigate
  }, []);

  useEffect(() => {
    if (errorMessage) {
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    }
  }, [errorMessage]);

  const handleSignIn = async () => {

    if (!email || !password) {
      setErrorMessage('Please fill in all fields.');
      return; // Return early if fields are empty
    }
  
    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!email.match(emailRegex)) {
      setErrorMessage('Please enter a valid email address.');
      return; // Return early if email format is invalid
    }

    // Implement your sign-in logic here
    console.log(`console.log({
      "email": "${email}",
      "password": "${password}"
    }`);

    try {
      // Send a POST request with the user's signup data
      const response = await fetch(URLaddress + '/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, password: password }),
      });

      // Check the response status
      if (response.status === 200) {
        // Store the JSON response in a constant
        const data = await response.json();
        console.log('Log In successful! : ', data);
        // Store details in async storage
        try {
          // Store userId
          await AsyncStorage.setItem('userId', data.id);
          // Store stoken
          await AsyncStorage.setItem('stoken', data.token);
          // Store pwd
          await AsyncStorage.setItem('pwd', password);
          console.log('User data stored successfully');
        } catch (error) {
          console.error('Error storing user data:', error);
        }
        loggedUser.userId = data.id;
        // Handle the response as needed
        navigation.navigate('Home');

      } else {
        console.error('Log in failed.');
        response.text()
          .then(data => {
            // Extract error message from plain text data
            const errorMessage = data || 'Sign up failed. Please try again.';

            // Display error banner with error message
            setErrorMessage(errorMessage);
          })
          .catch(error => {
            // Display error banner with default error message
            setErrorMessage('Sign up failed. Please try again.');
          });
      }
    } catch (error) {
      console.error('Log in failed:', error);
    }
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp'); //Navigate to SignUp
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Sign In</Text>
      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>New user? </Text>
        <TouchableOpacity onPress={handleSignUp}>
          <Text style={[styles.signupText, styles.signupLink]}>Sign up here</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    width: '80%',
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#007aff',
    padding: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  signupText: {
    color: '#333',
  },
  signupLink: {
    color: '#007aff',
  },
  errorBanner: {
    position: 'absolute',
    top: 0, // Set top to 0 to position the error banner at the top of the screen
    backgroundColor: 'red',
    marginTop: 20,
    padding: 10,
    zIndex: 999,
    borderRadius: 10,
    textAlign: 'center',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});
