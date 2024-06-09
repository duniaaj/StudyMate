import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Linking, PermissionsAndroid, Platform } from 'react-native';
import Realm from 'realm';
import { initializeRealm } from '../../DBase';
import FileViewer from 'react-native-file-viewer';
import mime from 'mime';
import RNFetchBlob from 'rn-fetch-blob';

const getRealPathFromContentUri = async (uri) => {
  if (Platform.OS === 'android') {
    const filePath = decodeURIComponent(uri.replace('content://com.android.providers.downloads.documents/document/raw%3A', '/storage/emulated/0'));
    return filePath;
  } else {
    return uri;
  }
};

const Note = ({ route }) => {
  const { courseName } = route.params;
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [realm, setRealm] = useState(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const realmInstance = await initializeRealm();
        const fetchedMaterials = realmInstance.objects('Material').filtered(`course_name == "${courseName}"`);
        setMaterials(fetchedMaterials);
        setFilteredMaterials(fetchedMaterials);
        setRealm(realmInstance);
        console.log('fetchedMaterials: ', fetchedMaterials);
      } catch (error) {
        console.error('Failed to fetch materials:', error);
      }
    };

    fetchMaterials();

    return () => {
      if (realm) {
        realm.close();
      }
    };
  }, [courseName]);

  useEffect(() => {
    if (realm) {
      const materialsListener = (newMaterials, changes) => {
        setMaterials([...newMaterials]);
        filterMaterials(searchQuery, [...newMaterials]);
      };

      const fetchedMaterials = realm.objects('Material').filtered(`course_name == "${courseName}"`);
      fetchedMaterials.addListener(materialsListener);

      return () => {
        fetchedMaterials.removeListener(materialsListener);
        if (realm) {
          realm.close();
        }
      };
    }
  }, [realm, courseName]);

  const filterMaterials = (query, materialsList) => {
    if (!query) {
      setFilteredMaterials(materialsList);
    } else {
      const filtered = materialsList.filter((material) =>
        material.matt_name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMaterials(filtered);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterMaterials(query, materials);
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'This app needs permission to access your storage to open documents.',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (error) {
        console.error('Failed to request storage permission:', error);
        return false;
      }
    }
    return true;
  };

  const openDocument = async (documentUri) => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        console.error('Permission denied');
        return;
      }

      let filePath = documentUri;

      if (documentUri.startsWith('content://')) {
        const res = await RNFetchBlob.fs.stat(documentUri);
        filePath = res.path;
      } else if (documentUri.startsWith('file://')) {
        filePath = decodeURIComponent(documentUri.replace('file://', ''));
      } else if (documentUri.startsWith('http://') || documentUri.startsWith('https://')) {
        await Linking.openURL(documentUri);
        return;
      }

      const fileType = mime.getType(filePath);

      if (!fileType || fileType === 'application/octet-stream') {
        await Linking.openURL(filePath);
        return;
      }

      await FileViewer.open(filePath, { showOpenWithDialog: true, mimeType: fileType });
    } catch (error) {
      console.error('Failed to open the document:', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.noteContainer}>
      <TouchableOpacity
        style={styles.documentContainer}
        onPress={() => openDocument(item.mat_content)}
      >
        <Text style={styles.documentName}>{item.matt_name}</Text>
        <Text style={styles.courseName}> ({item.course_name})</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.courseHeader}>{`Notes for ${courseName}`}</Text>
      <TextInput
        style={styles.searchBar}
        placeholder="Search notes..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filteredMaterials}
        keyExtractor={(item) => item.mat_id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.courseHeader}>No Notes Available.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  courseHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  searchBar: {
    fontSize: 16,
    padding: 10,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
  },
  noteContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  documentContainer: {
    marginBottom: 10,
  },
  documentName: {
    fontSize: 16,
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
});

export default Note;