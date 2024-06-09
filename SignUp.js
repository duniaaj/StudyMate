import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { initializeRealm } from '../../DBase'; // Import the initialized Realm instance
import { Picker } from '@react-native-picker/picker';


const SignUp = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [userid, setUserid] = useState('');
  const [password, setPassword] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [majors, setMajors] = useState([]);
  const [signUpError, setSignUpError] = useState('');
  const [majorName, setmajorName] = useState('');
  let newUserId = Math.floor(Math.random() * 1000);

  useEffect(() => {
    
    fetchMajors();
  }, []);


  const fetchMajors = async () => {
    try {
      
      const realm = await initializeRealm();

      
      const majors = realm.objects('Major').sorted('major_name');
      setMajors(majors);
    } catch (error) {
      console.error('Error fetching majors:', error);
      
    }
  };

  const handleSignUp = async () => {
    
    if (!username || !password || !selectedMajor) {
      setSignUpError('Please fill in all the fields.');
      return;
    }
    if (password.length < 8) {
      setSignUpError('Password must be at least 8 characters long.');
      return;
    }
  
    let realm;
    try {
      
       realm = await initializeRealm();
  
      
      const selectedMajorObject = majors.find(major => major.major_name === selectedMajor);
  
      
      if (!selectedMajorObject) {
        console.error('Selected major not found:', selectedMajor);
        setSignUpError('Selected major not found. Please try again.');
        return;
      }
  
      
      realm.write(() => {
        const newUser = realm.create('Student', {
          stu_id:newUserId, 
          stu_name: username,
          stu_password: password,
          major_name: selectedMajorObject, 
        });
      });
  
      Alert.alert('Signed up successfully');
      setUserid(newUserId);
      // Navigate to the login page and pass user details including major name
      navigation.navigate('LoginPage', {
        username: username,
        majorName: selectedMajorObject.major_name,
        userid: newUserId
      });
    } catch (error) {
      console.error('Error signing up:', error);
      setSignUpError('An error occurred while signing up. Please try again.');
    } finally {
      // Close Realm instance
      if (realm) {
        realm.close();
      }
    }
  };
  
  
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign up</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        onChangeText={text => setUsername(text)}
        value={username}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={text => setPassword(text)}
        value={password}
        secureTextEntry
      />
     <Picker
  style={styles.input}
  selectedValue={selectedMajor}
  onValueChange={(itemValue, itemIndex) => {
    setSelectedMajor(itemValue);
    setmajorName(itemValue); 
  }}
>
  <Picker.Item label="Select a major" value="" />
  {majors.map(major => (
    <Picker.Item key={major.Major_id} label={major.major_name} value={major.major_name} />
  ))}
</Picker>

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Confirm</Text>
      </TouchableOpacity>
      {signUpError ? <Text style={styles.errorText}>{signUpError}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff', // Lighter, softer background color
    padding: 20, // Added padding for better spacing
  },
  title: {
    fontSize: 36, // Slightly smaller font size for a balanced look
    fontWeight: '700', // Increased weight for better readability
    marginBottom: 30, // More spacing below the title
    color: '#333', // Softer black color for the text
  },
  input: {
    width: '90%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8, // More rounded corners
    marginBottom: 20, // Increased bottom margin for better spacing
    paddingHorizontal: 15, // More padding for better text placement
    backgroundColor: '#fff',
    shadowColor: '#000', // Adding a shadow for a slight 3D effect
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  button: {
    width: '90%', // Make button width consistent with input
    height: 50, // Increased height for better touch target
    backgroundColor: '#0056b3', // Darker blue for better contrast
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8, // Consistent rounded corners
    marginTop: 20, // More spacing above the button
    shadowColor: '#000', // Adding a shadow for a slight 3D effect
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18, // Slightly larger font size
    fontWeight: 'bold',
  },
  errorText: {
    marginTop: 15, // Increased top margin for better spacing
    color: 'red',
    fontSize: 17, // Slightly smaller font size
    fontWeight: 'bold',
  },
});

export default SignUp;
