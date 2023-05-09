import { Camera, CameraType } from 'expo-camera'
import { React, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { URLaddress } from './App'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function CameraSendToServer () {
  const [type, setType] = useState(CameraType.back)
  const [permission] = Camera.useCameraPermissions()
  const [camera, setCamera] = useState(null)
  const navigation = useNavigation()

  function toggleCameraType () {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back))
    console.log('Camera: ', type)
  }

  async function takePhoto () {
    if (camera) {
      const options = { quality: 0.5, base64: true, onPictureSaved: (data) => sendToServer(data) }
      await camera.takePictureAsync(options)
    }
  }

  async function sendToServer (data) {
    console.log('HERE', data.uri)

    const res = await fetch(data.uri)
    const blob = await res.blob()

    const stoken = await AsyncStorage.getItem('stoken')
    const auserId = await AsyncStorage.getItem('userId')
    try {
      const response = await fetch(`${URLaddress}/user/${auserId}/photo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'image/jpeg', // or 'image/png'
          'X-Authorization': stoken
        },
        body: blob
      })

      console.log(response.status)

      // Check the response status
      if (response.status === 200) {
        console.log('Image upload successful!')
        navigation.navigate('Home')
      } else {
        console.error('Image upload failed.')
      }
    } catch (error) {
      console.error('Image upload failed:', error)
    }
  }

  if (!permission || !permission.granted) {
    return (
    <Text>No access to camera</Text>)
  } else {
    return (
      <View style={styles.container}>
        <Camera style={styles.camera} type={type} ref={ref => setCamera(ref)}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={takePhoto}>
              <Text style={styles.text}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  buttonContainer: {
    alignSelf: 'flex-end',
    padding: 5,
    margin: 5,
    backgroundColor: 'steelblue'
  },
  button: {
    width: '100%',
    height: '100%'
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ddd'
  }
})
