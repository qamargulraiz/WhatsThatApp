import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { URLaddress, loggedUser } from './App';
import { FontAwesome } from '@expo/vector-icons';

export function getContacts([contacts, setContacts]) {
  
      // Use an async function inside useEffect to fetch data
      async function fetchContacts() {
        try {
          // Send a GET request with the user's authorization token
          const response = await fetch(URLaddress + '/contacts', {
            headers: {'X-Authorization': loggedUser.Stoken},
          });
  
          // Check the response status
          if (response.status === 200) {
            // Store the JSON response in a constant and set state
            const data = await response.json();
            setContacts(data);
          } else {
            console.error('Failed to retrieve contacts');
          }
        } catch (error) {
          console.error('Get Contact error:', error);
        }
      }
  
      fetchContacts();
    
    return contacts;
}


export async function postContact(userId){
    try {
        // Send a POST request with the user's signup data
        const response = await fetch(URLaddress +'/user/'+ userId + '/contact', {
          method: 'POST',
          headers: {'X-Authorization': loggedUser.Stoken},
        });
  
        // Check the response status
        if (response.status === 200) {
          
          console.log('Contact Successfully Saved!');
    
          
        } else {
          console.error('Save failed.');
        }
      } catch (error) {
        console.error('Save failed:', error);
      }
};

export async function deleteContact(userId){
    try {
        // Send a DELETE request with the user's signup data
        const response = await fetch(URLaddress +'/user/'+ userId + '/contact', {
          method: 'DELETE',
          headers: {'X-Authorization': loggedUser.Stoken},
        });
  
        // Check the response status
        if (response.status === 200) {
          
          console.log('Contact Successfully deleted!');
    
          
        } else {
          console.error('Delete failed.');
        }
      } catch (error) {
        console.error('Delete failed:', error);
      }
};
  