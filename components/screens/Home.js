import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { initializeRealm } from '../../DBase';

const Home = ({ route, navigation }) => {
  const { username, majorName, userid, courses } = route.params;

 const [course, setCourse]= useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  
  console.log(userid);

  useEffect(() => {
    const fetchCourses = async () => {
      let realm;
      try {
        // Open Realm instance
        realm = await initializeRealm();
        console.log('Realm opened successfully');
        
        // Fetch courses related to the student's major
        const major = realm.objects('Major').filtered('major_name == $0', majorName)[0];
        if (major) {
          const courses = realm.objects('Course').filtered('majors.Major_id == $0', major.Major_id);
          console.log('Fetched courses:', courses);
          setCourse([...courses]);
        }
      } catch (error) {
        console.error('Error opening Realm or fetching courses:', error);
      } finally {
        // Close the Realm instance when done
        if (realm && !realm.isClosed) {
          realm.close();
          console.log('Realm closed successfully');
        }
      }
    };
  
    fetchCourses();
  }, [majorName]);
  
  

  const renderCourseItem = ({ item, index }) => {
    console.log('Rendering course:', item.Course_name);
    const isSelected = selectedCourses.some(course => course.Course_id === item.Course_id);
    return (
      <TouchableOpacity
        key={index.toString()}
        onPress={() => {
          console.log(`Selected course: ${item.Course_name}`);
          if (isSelected) {
            setSelectedCourses(selectedCourses.filter(course => course.Course_id !== item.Course_id));
          } else {
            setSelectedCourses([...selectedCourses, item]);
          }
        }}
        style={isSelected ? styles.selectedCourseItem : styles.courseItem}
      >
        <Text style={styles.courseItemText}>{item.Course_name}</Text>
      </TouchableOpacity>
    );
  };
  console.log(selectedCourses);

  const saveCourses = async () => {
    let realm;
    try {
      realm = await initializeRealm();
      const student = realm.objects('Student').filtered('stu_id == $0', userid)[0];

      realm.write(() => {
        selectedCourses.forEach(course => {
          const realmCourse = realm.objectForPrimaryKey('Course', course.Course_id);
          if (realmCourse && student) {
            let id = Math.floor(Math.random() * 1000); // Generate a new ID for each studentCourse
            const studentCourse = {
              ID: id,
              Course_id: realmCourse,
              stu_id: student,
            };
            realm.create('StudentCourse', studentCourse);
            console.log(realmCourse);
          } else {
            console.log('Course or student not found:', realmCourse, student);
          }
        });
      });

      navigation.navigate('MenuScreen', { username, selectedCourses, majorName,userid });
    } catch (error) {
      console.error('Error saving courses:', error);
    } finally {
      if (realm) {
        realm.close();
      }
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {username}!</Text>
      <Text style={styles.subtitle}>You are logged in.</Text>
      <Text style={styles.subtitle}>Your Major is: {majorName}</Text>
      <Text style={styles.subtitle}>Choose Your Courses.</Text>
      <FlatList
        data={courses}
        keyExtractor={item => item.Course_id.toString()}
        renderItem={renderCourseItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No courses available</Text>}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity
        style={styles.saveButton}
        onPress={saveCourses}
      >
        <Text style={styles.saveButtonText}>Save Courses</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  listContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  courseItem: {
    width: '100%',
    padding: 15,
    backgroundColor: '#F0F8FF',
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    elevation: 3,
  },
  selectedCourseItem: {
    width: '100%',
    padding: 15,
    backgroundColor: '#87CEEB',
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    elevation: 3,
  },
  courseItemText: {
    color: '#0000FF',
    fontSize: 20,
  },
  selectedCourseItemText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 18,
    color: '#0000FF',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#0056b3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 18,
    color: '#fff',
  },
});

export default Home;
