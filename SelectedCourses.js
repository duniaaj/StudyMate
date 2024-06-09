import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const SelectedCourses = ({ route, navigation }) => {
  const { selectedCourses } = route.params;
  const [localSelectedCourses, setLocalSelectedCourses] = useState(selectedCourses);
  console.log(selectedCourses);
  const handleCoursePress = (selectedCourse) => {
    navigation.navigate('ImageUploader', { selectedCourse });
  };

  const renderCourseItem = ({ item, index }) => {
    const isSelected = localSelectedCourses.includes(item);
    return (
      <TouchableOpacity
        key={index.toString()}
        onPress={() => {
          handleCoursePress(item);
          setLocalSelectedCourses(
            isSelected
              ? localSelectedCourses.filter(course => course !== item)
              : [...localSelectedCourses, item]
          );
        }}
        style={isSelected ? styles.selectedCourseItem : styles.courseItem}
      >
        <Text style={styles.courseText}>{item}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.txt}>Choose Course to upload notes to:</Text>
      <FlatList
        data={selectedCourses}
        renderItem={renderCourseItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0', // Added a light background color
  },
  listContainer: {
    paddingVertical: 20,
  },
  courseItem: {
    padding: 15,
    fontSize: 20,
    borderWidth: 1,
    borderColor: 'lightgray',
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  selectedCourseItem: {
    padding: 15,
    fontSize: 20,
    borderWidth: 1,
    borderColor: 'lightgray',
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#0056b3',
    alignItems: 'center',
  },
  courseText: {
    fontSize: 18,
    color: 'white',
  },
  txt: {
    fontSize: 18,
    color: '#333',
  },
});

export default SelectedCourses;
