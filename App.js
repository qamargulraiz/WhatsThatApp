import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SignIn from './SignIn';
import SignUp from './SignUp';
import Home from './Home';
import Chat from './Chat';


const Stack = createStackNavigator();

//export const URLaddress = "http://10.0.2.2:3333/api/1.0.0";
export const URLaddress = "http://localhost:3333/api/1.0.0";

let loggedUser = { userId: '', Stoken: '' };
if (typeof loggedUser !== 'undefined' && loggedUser.userId !== '' && loggedUser.Stoken !== '') {
  // If loggedUser already exists and has values for userId and Stoken, don't change them
} else {
  // If loggedUser doesn't exist or has empty values for userId and Stoken, initialize it with default values
  loggedUser = { userId: '', Stoken: '' };
}
export { loggedUser };

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>

      <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen name="SignUp" component={SignUp} />

      <Stack.Screen name="Home" component={Home} options={{ headerShown: false }}/>
        <Stack.Screen name="Chat" component={Chat} options={{ headerShown: false }} />
        

      </Stack.Navigator>
    </NavigationContainer>
  );
}

