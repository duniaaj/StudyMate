import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { initializeRealm } from '../../DBase';

const MenuScreen = ({ route, navigation }) => {
  const { username, selectedCourses, majorName, userid } = route.params;
  const [user, setUser] = useState(null);
  const [chatRoomId, setChatRoomId] = useState(null);

  async function createChatRooms() {
    try {
      const realm = await initializeRealm();
      const majors = realm.objects('Major');
  
      majors.forEach((major) => {
        realm.write(() => {
          const randomNum = Math.floor(Math.random() * 1000);
          const chatRoomId = `${major.Major_id}_${randomNum}`;
          const chatRoom = realm.create('ChatRoom', {
            id: chatRoomId,
            name: `Chat Room for ${major.major_name}`,
            description: `Chat room for students in ${major.major_name}`,
            major_name: major,
          });
          setChatRoomId(chatRoomId);
  
          // Filter students by major object reference
          const students = realm.objects('Student').filtered('major_name = $0', major);
          students.forEach((student) => {
            chatRoom.member.push(student);
          });
        });
      });
  
      realm.close();
    } catch (error) {
      console.error('Error creating chat rooms:', error);
      throw error;
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const realm = await initializeRealm();
        const userData = realm.objectForPrimaryKey('Student', userid);
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      createChatRooms();
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <View style={styles.container1}>
        <Text style={styles.title}>Where do you want to go next, {username}!</Text>
      </View>
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Profil', { username, selectedCourses, majorName })}>
          <Text style={styles.menuItemText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('ChatRoom', { username, userid, chatRoomId, chatRoomName: `Chat Room for ${majorName}` })}>
          <Text style={styles.menuItemText}>Chat Room</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Course', { username , selectedCourses})}>
          <Text style={styles.menuItemText}>View Notes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('SelectedCourses', { username, selectedCourses })}>
          <Text style={styles.menuItemText}>Note Upload</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('HomeScreenNavigation')}>
          <Text style={styles.menuItemText}>Chat bot</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  menu: {
    width: '100%',
    marginTop: 20,
  },
  menuItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    color: '#0056b3',
    fontSize: 18,
    fontWeight: '500',
  },
});

export default MenuScreen;
