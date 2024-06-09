import { StatusBar } from 'expo-status-bar';
import React , {useState, useEffect} from 'react';
import { StyleSheet, Text, View , Image} from 'react-native';
import LoginPage from './components/screens/LoginPage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, createStackNavigator } from '@react-navigation/native-stack';
import SignUp from './components/screens/SignUp';
import { initializeRealm } from './DBase';
import Realm from 'realm';
import SplashScreen from 'react-native-splash-screen';
import Home from './components/screens/Home';
import MenuScreen from './components/screens/MenuScreen';
import Course from './components/screens/Course';
import ImageUploader from './components/screens/ImageUploader';
import Note from './components/screens/Note';
import Profil from './components/screens/Profil';
import SelectedCourses from './components/screens/SelectedCourses';
import ChatRoom from './components/screens/ChatRoom';
import HomeScreenNavigation from './App/Navigation/HomeScreenNavigation';

export default function App() {
  const Stack = createNativeStackNavigator();
  const [showSplash, setShowSplash] = useState(true);

  const insertCourseData = async () => {
    let realm;
    try {
      realm = await initializeRealm();
  
      // Fetch the majors by their IDs
      const smartSystemMajor = realm.objectForPrimaryKey('Major', 1111);
      const computerEngMajor = realm.objectForPrimaryKey('Major', 1112);
      const multiMediaMajor = realm.objectForPrimaryKey('Major', 1115);
      const itMajor = realm.objectForPrimaryKey('Major', 1113);
      const misMajor = realm.objectForPrimaryKey('Major', 1114);

      realm.write(() => {
        // Insert courses and associate them with majors
        const course1 = realm.create('Course', {
          Course_id: 471122,
          Course_name: 'Circuits 1',
          majors: [smartSystemMajor, computerEngMajor]  // Course associated with multiple majors
        });
        
        const course2 = realm.create('Course', {
          Course_id: 471212,
          Course_name: 'Circuits 2',
          majors: [smartSystemMajor,computerEngMajor]
        });
        
        const course3 = realm.create('Course', {
          Course_id: 471412,
          Course_name: 'Sensors',
          majors: [smartSystemMajor]
        });
        
        const course4 = realm.create('Course', {
          Course_id: 471413,
          Course_name: 'Signal and Control Systems',
          majors: [smartSystemMajor]
        });
        
        const course5 = realm.create('Course', {
          Course_id: 471441,
          Course_name: 'Software Engineering',
          majors: [computerEngMajor,smartSystemMajor, multiMediaMajor,itMajor ,misMajor ]
        });
        
        const course6 = realm.create('Course', {
          Course_id: 471432,
          Course_name: 'Cyber Security',
          majors: [smartSystemMajor]
        });
        const course7 = realm.create('Course', {
          Course_id: 410449,
          Course_name: 'Virtual Realty',
          majors: [multiMediaMajor]
        });
        const course8 = realm.create('Course', {
          Course_id: 440310,
          Course_name: 'Animation',
          majors: [multiMediaMajor]
        });
        const course9 = realm.create('Course', {
          Course_id: 410220,
          Course_name: 'Advanced Computer Programming',
          majors: [itMajor]
        });
        const course10= realm.create('Course', {
          Course_id: 410426,
          Course_name: 'Database',
          majors: [itMajor]
        });
        const course11= realm.create('Course', {
          Course_id: 430101,
          Course_name: 'Managment Information Systems',
          majors: [misMajor]
        });
        const course12= realm.create('Course', {
          Course_id: 430208,
          Course_name: 'Accounting',
          majors: [misMajor]
        });
      });
  
      console.log('Course data inserted successfully');
    } catch (error) {
      console.error('Error inserting Course data:', error);
      throw error;
    } finally {
      if (realm) {
        realm.close();
      }
    }
  };
  
  


  const insertMajorData = async () => {
    let realm;
    try {
      realm = await initializeRealm();
  
      realm.write(() => {
        // Insert multiple majors with an empty courses list
        const majors = [
          { Major_id: 1111, major_name: 'Smart System Engineering', courses: [] },
          { Major_id: 1112, major_name: 'Computer Engineering', courses: [] },
          { Major_id: 1113, major_name: 'Information Technology', courses: [] },
          { Major_id: 1114, major_name: 'Management Information System', courses: [] },
          { Major_id: 1115, major_name: 'Multi Media', courses: [] },
        ];
  
        majors.forEach(major => realm.create('Major', major));
      });
  
      console.log('Major data inserted successfully');
    } catch (error) {
      console.error('Error inserting major data:', error);
      throw error;
    } finally {
      if (realm) {
        realm.close();
      }
    }
  };
  



  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Realm Database Path:', Realm.defaultPath);

       //viewDatabaseContents();
      //insertCourseData();
      //insertMajorData();

      
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate a delay
      } catch (error) {
        console.error('Error:', error);
        // Handle error
      } finally {
        setShowSplash(false);
        SplashScreen.hide(); // Hide splash screen after everything is done
      }
    };

    fetchData(); // Call fetchData to start the process

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <NavigationContainer>
       {showSplash ? (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={require('./components/images/logo2.jpg')}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>
    ) : (
      <Stack.Navigator>
        <Stack.Screen name="LoginPage" component={LoginPage} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="MenuScreen" component={MenuScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Note" component={Note} options={{ headerShown: false }} />
        <Stack.Screen name="Profil" component={Profil} options={{ headerShown: false }} />
        <Stack.Screen name="SelectedCourses" component={SelectedCourses} options={{ headerShown: false }} />
        <Stack.Screen name="ImageUploader" component={ImageUploader} options={{ headerShown: false }} />
        <Stack.Screen name="Course" component={Course} options={{ headerShown: false }} />
        <Stack.Screen name="ChatRoom" component={ChatRoom} options={{ headerShown: false }} />
        <Stack.Screen name="HomeScreenNavigation" component={HomeScreenNavigation} options={{ headerShown: false }} />
        
      </Stack.Navigator>
    )}

  </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
