import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, PermissionsAndroid, Platform  } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { initializeRealm } from '../../DBase';

const ImageUploader = ({ route }) => {
  const { selectedCourse } = route.params;
  const [document, setDocument] = useState(null);
  const [materialName, setMaterialName] = useState('');

  const requestStoragePermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'This app needs access to your storage to read files',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true; // iOS does not require explicit permissions to read storage
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handleDocument = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Storage permission is required to select a document.');
      return;
    }
  
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      console.log('Document selected:', res);
      setDocument(res[0]);
  
      // Log all properties of the selected document to see what URIs are available
      console.log('Document URI:', res[0].uri);
      console.log('File Copy URI:', res[0].fileCopyUri);
      console.log('Document details:', res[0]);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the picker');
      } else {
        console.error('Error picking document:', err);
      }
    }
  };
  

  const handleAddNote = async () => {
    if (!document) {
      Alert.alert('Error', 'Please select a document.');
      return;
    }
    if (!materialName.trim()) {
      Alert.alert('Error', 'Please enter a material name.');
      return;
    }
  
    let realm;
    try {
      realm = await initializeRealm();
  
      const noteId = Math.floor(Math.random() * 1000);
  
      console.log('Adding note for course:', selectedCourse);
  
      const documentUri = document.fileCopyUri ? document.fileCopyUri : document.uri;
  
      if (selectedCourse) {
        realm.write(() => {
          realm.create('Material', {
            mat_id: noteId,
            mat_content: documentUri,
            matt_name: materialName.trim(),
            course_name: selectedCourse,
          });
          console.log('Material created successfully:', {
            mat_id: noteId,
            mat_content: documentUri,
            matt_name: materialName.trim(),
            course_name: selectedCourse,
          });
        });
        Alert.alert('Success', 'Document added successfully.');
        setDocument(null);
        setMaterialName('');
      } else {
        console.error('Course_name is missing for selected course');
        Alert.alert('Error', 'Course name is missing for selected course.');
      }
    } catch (err) {
      console.error('Failed to add note:', err);
      Alert.alert('Error', 'Failed to add note. Please try again.');
    } finally {
      if (realm) {
        realm.close();
      }
    }
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.txt}>Choose a file to upload for {selectedCourse} </Text>
        <TouchableOpacity style={styles.button} onPress={handleDocument}>
          <Text style={styles.buttonText}>SELECT FILE</Text>
        </TouchableOpacity>
        {document && <Text style={styles.fileName}>Selected File: {document.name}</Text>}
        <TextInput
          style={styles.input}
          placeholder="Enter material name"
          value={materialName}
          onChangeText={setMaterialName}
        />
      </View>
      <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleAddNote}>
        <Text style={styles.buttonText}>SUBMIT</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileName: {
    fontSize: 16,
    color: '#333',
    marginVertical: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    width: '80%',
  },
  submitButton: {
    backgroundColor: '#28A745',
    marginBottom: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  txt: {
    fontSize: 20,
    color: '#333',
    marginBottom: 20,
  },
});

export default ImageUploader;
