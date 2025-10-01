import { useQuery, useRealm } from '@realm/react';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Profile } from '../../models/Profile';

export default function ProfileScreen() {
  // State for managing edit mode and form fields
  const [isEditing, setIsEditing] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthday: '',
  });

  // Get the Realm instance and query for existing profiles
  const realm = useRealm();
  const savedProfile = useQuery(Profile);

  // Load profile data when the component mounts or profiles change
  useEffect(() => {
    if (savedProfile.length > 0) {
      const profile = savedProfile[0];
      setCurrentProfile(profile);
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        birthday: profile.dateOfBirth ? profile.dateOfBirth.toISOString().split('T')[0] : '',
      });
    }
  }, [savedProfile]);

  // Handle saving data to Realm
  const handleSave = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert('Error', 'First name and last name are required.');
      return;
    }

    realm.write(() => {
      if (currentProfile) {
        // Update existing profile
        currentProfile.firstName = formData.firstName;
        currentProfile.lastName = formData.lastName;
        currentProfile.dateOfBirth = formData.birthday ? 
          (() => {
            const [year, month, day] = formData.birthday.split('-').map(Number);
            return new Date(Date.UTC(year, month - 1, day));
          })() : 
          undefined;
      } else {
        // Create a new profile if none exists
        realm.create('Profile', {
          _id: new Realm.BSON.ObjectId(),
          firstName: formData.firstName,
          lastName: formData.lastName,
          birthday: formData.birthday ? new Date(formData.birthday) : undefined,
        });
      }
    });

    setIsEditing(false);
    Alert.alert('Success', 'Profile saved successfully!');
  };

  // Toggle between view and edit modes
  const handleEditToggle = () => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
    }
  };

  // Handle input changes for the form
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <View style={styles.container}>

      {/* First Name Field */}
      <View style={{ marginBottom: 15 }}>
        <Text style={styles.text}>First Name</Text>
        {isEditing ? (
          <TextInput
            style={{ color: 'white', borderColor: 'white', borderWidth: 1, padding: 8, marginTop: 5 }}
            value={formData.firstName}
            onChangeText={(text) => handleInputChange('firstName', text)}
            placeholder="Enter first name"
          />
        ) : (
          <Text style={{ color: 'white', fontSize: 18, marginTop: 5 }}>
            {currentProfile?.firstName || 'App'}
          </Text>
        )}
      </View>

      {/* Last Name Field */}
      <View style={{ marginBottom: 15 }}>
        <Text style={styles.text}>Last Name</Text>
        {isEditing ? (
          <TextInput
            style={{ color: 'white', borderColor: 'white', borderWidth: 1, padding: 8, marginTop: 5 }}
            value={formData.lastName}
            onChangeText={(text) => handleInputChange('lastName', text)}
            placeholder="Enter last name"
          />
        ) : (
          <Text style={{ color: 'white', fontSize: 18, marginTop: 5 }}>
            {currentProfile?.lastName || 'User'}
          </Text>
        )}
      </View>

      {/* Birthday Field */}
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.text}>Date of Birth</Text>
        {isEditing ? (
          <TextInput
            style={{ color: 'white', borderColor: 'white', borderWidth: 1, padding: 8, marginTop: 5 }}
            value={formData.birthday}
            onChangeText={(text) => handleInputChange('birthday', text)}
            placeholder="YYYY-MM-DD"
          />
        ) : (
          <Text style={{ color: 'white', fontSize: 18, marginTop: 5 }}>
            {currentProfile?.dateOfBirth ? currentProfile.dateOfBirth.toDateString() : 'Not set'}
          </Text>
        )}
      </View>

      {/* Edit/Save Button */}
      <TouchableOpacity
        style={{
          backgroundColor: '#ffd33d',
          padding: 15,
          borderRadius: 5,
          alignItems: 'center',
        }}
        onPress={handleEditToggle}
      >
        <Text style={{ color: 'white', fontSize: 16 }}>
          {isEditing ? 'Save Profile' : 'Edit Profile'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    flex: 1,
    backgroundColor: '#25292e',
  },
  text: {
    color: '#fff',
  },
});
