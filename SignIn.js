import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { URLaddress, loggedUser } from './App';
//import AsyncStorage from '@react-native-async-storage/async-storage';


export default function SignIn({ navigation }) {  

  // if (typeof loggedUser !== 'undefined' && loggedUser.userId !== '' && loggedUser.Stoken !== '') {
  //   // If loggedUser already exists and has values for userId and Stoken, don't change them
  //   navigation.navigate('Home');
  // }
  // console.log(loggedUser);
  // const [loggedIn, setLoggedIn] = useState(false);
  // useEffect(() => {
  //   // Check if the user is logged in
  //   AsyncStorage.getItem('loggedUser').then(user => {
  //     if (user) {
  //       setLoggedIn(true);
  //       navigation.navigate('Home');
  //     }
  //   });
  // }, []);




  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
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
        body: JSON.stringify({ email: email, password: password}),
      });

      // Check the response status
      if (response.status === 200) {
        // Store the JSON response in a constant
        const data = await response.json();
        console.log('Log In successful! : ', data);
        // Store the token in a variable
        //setLoggedIn(true);

        loggedUser.userId = data.id;
        loggedUser.Stoken = data.token;
        loggedUser.pwd = password;
        console.log(loggedUser);
        // Handle the response as needed
        navigation.navigate('Home');
        
      } else {
        console.error('Log in failed.');
      }
    } catch (error) {
      console.error('Log in failed:', error);
    }
  };

  const handleSignUp = () => {
    // Implement your navigation logic to the sign-up page here
    navigation.navigate('SignUp');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Sign In</Text>
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
});
