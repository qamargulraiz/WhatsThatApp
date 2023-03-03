import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { URLaddress } from './App';
import { loggedUser } from './App';
import { getContacts, postContact } from './Contact';
import { FontAwesome } from '@expo/vector-icons';



export async function postSignUp(firstname, lastname, email, password) {
      
    try {
        // Send a POST request with the user's signup data
        const response = await fetch(URLaddress + '/user', {
          method: 'POST',
          headers: {'Content-Type': 'application/json',},
          body: JSON.stringify({ first_name: firstname, last_name: lastname, email: email, password: password}),
        });
        
        console.log(response.status);

        // Check the response status
        if (response.status === 201) {
          console.log('Sign up successful!');
        } else {
          console.error('Sign up failed.');
        }
    } catch (error) {
        console.error('Sign up failed:', error);
    }
   
}

export async function getUserInfo(userId) {
  
    try {
        // Send a GET request with the user's authorization token
        const response = await fetch(URLaddress + '/user/' + userId, {
          headers: {'X-Authorization': loggedUser.Stoken},
        });

        // Check the response status
        if (response.status === 200) {
          // Store the JSON response in a constant and set state
          const data = await response.json();
          return data;
        } else {
          console.error('Failed to retrieve user info');
        }
    } catch (error) {
        console.error('Get user info error:', error);
    }
    
}

export async function patchUserInfo(updateBody) {    
    try {
        // Send a PATCH request with the user's signup data
        const response = await fetch(URLaddress + '/user/' + loggedUser.userId, {
          method: 'PATCH',
          headers: {'Content-Type': 'application/json', 'X-Authorization': loggedUser.Stoken}, 
          body: JSON.stringify(updateBody),
        });
        
        console.log(response.status);

        // Check the response status
        if (response.status === 201) {
          console.log('Sign up successful!');
        } else {
          console.error('Sign up failed.');
        }
    } catch (error) {
        console.error('Sign up failed:', error);
    }
   
}

export async function postLogout() {
      
    try {
        // Send a POST request with token for logout
        const response = await fetch(URLaddress + '/logout', {
          method: 'POST',
          headers: {'X-Authorization': loggedUser.Stoken,},
        });
        
        console.log(response.status);

        // Check the response status
        if (response.status === 200) {
          console.log('Logout successful!');
          loggedUser.userId = '';
          loggedUser.Stoken = '';
        } else {
          console.error('Logout failed.');
        }
    } catch (error) {
        console.error('Logout failed:', error);
    }
   
}