import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { initializeRealm } from '../../DBase';

const LoginPage = ({ navigation }) => {
  const [majorName, setMajorName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userid, setUserid] = useState(null);

  const handleLogin = async () => {
    let realm;
    try {
      // Initialize Realm
      realm = await initializeRealm();
  
      // Perform login logic
      const user = realm.objects('Student').filtered('stu_name = $0 AND stu_password = $1', username, password)[0];
      if (user) {
        setUserid(user.stu_id);
        console.log(userid);
        const major = user.major_name;
        if (major) {
          setMajorName(major.major_name);
          // Fetch courses for the user's major
          const courses = realm.objects('Course').filtered('majors.Major_id == $0', major.Major_id);
          // Clone the courses before passing them as props
          const clonedCourses = courses.map(course => ({
            Course_id: course.Course_id,
            Course_name: course.Course_name,
          }));
          // Check if the user has selected courses
          const selectedCourses = realm.objects('StudentCourse').filtered('stu_id == $0', user);
          if (selectedCourses.length > 0) {
            // If user has selected courses, navigate to MenuScreen
            navigation.navigate('MenuScreen', {
              username: username,
              majorName: major.major_name,
              userid,
              selectedCourses: selectedCourses.map(course => course.Course_id.Course_name),
            });
          } else {
            // If no courses selected, navigate to Home
            navigation.navigate('Home', {
              username: username,
              majorName: major.major_name,
              userid,
              courses: clonedCourses,
            });
          }
        } else {
          // Major name not found, handle accordingly
          console.error('Major name not found for user:', username);
        }
      } else {
        // Incorrect credentials, show error message
        Alert.alert('Invalid Credentials', 'Please enter valid username and password.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      Alert.alert('Login Error', 'An error occurred while logging in. Please try again.');
    } finally {
      if (realm) {
        realm.close();
      }
    }
  };
  

  useEffect(() => {
    const fetchUserDetails = async () => {
      let realm;
      try {
        realm = await initializeRealm();
        const user = realm.objects('Student').filtered('stu_name = $0', username)[0];
        if (user) {
          if (user.major_name) {
            setMajorName(user.major_name.major_name);
          }
          setUserid(user.stu_id);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        // Close the Realm instance when done
        if (realm && !realm.isClosed) {
          realm.close();
          console.log('Realm closed successfully');
        }
      }
    };
  
    if (username) {
      fetchUserDetails();
    }
  }, [username]);
  

  return (
    <View style={styles.container}>
      <View style={styles.loginContainer}>
        <Text style={styles.title}>StudyMate</Text>
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
        <TouchableOpacity style={styles.btn} onPress={handleLogin}>
          <Text style={styles.buttonTxt}>Login</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.signupContainer}>
        <Text style={styles.text1}>Not a member yet?</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("SignUp")}>
          <Text style={styles.buttonText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#f0f8ff',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupContainer: {
    width: '100%',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    width: '90%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    fontSize: 18,
    backgroundColor: '#fff',
  },
  btn: {
    width: '90%',
    height: 50,
    backgroundColor: '#0056b3',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  button: {
    width: '90%',
    height: 40,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#0056b3',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonTxt: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    marginTop: 10,
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
  },
  text1: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default LoginPage;
