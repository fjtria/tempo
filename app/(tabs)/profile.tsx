import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useQuery, useRealm } from '@realm/react';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Profile } from '../../models/Profile';

const genderOptions = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Other', value: 'Other' },
  { label: 'Prefer not to say', value: 'Prefer not to say' },
];

const bloodTypeLetterOptions = [
  { label: 'A', value: 'A' },
  { label: 'B', value: 'B' },
  { label: 'AB', value: 'AB' },
  { label: 'O', value: 'O' },
];

const bloodTypeRhOptions = [
  { label: '+ (Positive)', value: '+' },
  { label: '- (Negative)', value: '-' },
];

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  
  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    birthday: Date | null;
    gender: string | null;
    bloodTypeLetter: string | null;
    bloodTypeRh: string | null;
  }>({
    firstName: '',
    lastName: '',
    birthday: null,
    gender: null,
    bloodTypeLetter: null,
    bloodTypeRh: null,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const realm = useRealm();
  const savedProfile = useQuery(Profile);

  // UTC date formatter
  const formatUTCDateForDisplay = (date: Date | null): string => {
    if (!date) return 'Select a date';

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    const year = date.getUTCFullYear();
    const month = monthNames[date.getUTCMonth()];
    const day = date.getUTCDate();

    return `${month} ${day}, ${year}`;
  };

  // Display combined blood type
  const formatBloodTypeForDisplay = (
    letter: string | null | undefined,
    rh: string | null | undefined
  ): string => {
    if (letter && rh) return `${letter}${rh}`;
    if (letter) return letter;
    if (rh) return rh;
    return 'Not set';
  };
  
  useEffect(() => {
    if (savedProfile.length > 0) {
      const profile = savedProfile[0];
      setCurrentProfile(profile);
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        birthday: profile.dateOfBirth ?? null,
        gender: profile.gender ?? null,
        bloodTypeLetter: profile.bloodTypeLetter ?? null,
        bloodTypeRh: profile.bloodTypeRh ?? null,
      });
    }
  }, [savedProfile]);

  const handleSave = () => {
    let dateOfBirth: Date | undefined = undefined;
    if (formData.birthday) {
      const localDate = formData.birthday;
      dateOfBirth = new Date(Date.UTC(
        localDate.getFullYear(),
        localDate.getMonth(),
        localDate.getDate()
      ));
    }
    realm.write(() => {
      if (currentProfile) {
        currentProfile.firstName = formData.firstName;
        currentProfile.lastName = formData.lastName;
        currentProfile.dateOfBirth = dateOfBirth;
      } else {
        realm.create('Profile', {
          _id: new Realm.BSON.ObjectId(),
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: dateOfBirth,
        });
      }
    });
    setIsEditing(false);
    Alert.alert('Success', 'Profile saved successfully!');
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (event.type === 'set' && selectedDate) {
      handleInputChange('birthday', selectedDate);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
    }
  };

  const handleInputChange = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <View style={styles.container}>
      {/* First Name Field */}
      <View style={{ marginBottom: 15 }}>
        <Text style={styles.text}>First Name</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={formData.firstName}
            onChangeText={(text) => handleInputChange('firstName', text)}
            placeholder="Enter first name"
          />
        ) : (
          <Text style={styles.valueText}>
            {currentProfile?.firstName || 'User'}
          </Text>
        )}
      </View>

      {/* Last Name Field */}
      <View style={{ marginBottom: 15 }}>
        <Text style={styles.text}>Last Name</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={formData.lastName}
            onChangeText={(text) => handleInputChange('lastName', text)}
            placeholder="Enter last name"
          />
        ) : (
          <Text style={styles.valueText}>
            {currentProfile?.lastName || 'User'}
          </Text>
        )}
      </View>

      {/* Birthday Field */}
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.text}>Date of Birth</Text>
        {isEditing ? (
          <>
            <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
              <Text style={{ color: '#020202' }}>
                {formatUTCDateForDisplay(formData.birthday)}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={formData.birthday || new Date()}
                mode="date"
                display="spinner"
                onChange={onDateChange}
              />
            )}
          </>
        ) : (
          <Text style={styles.valueText}>
            {currentProfile?.dateOfBirth ? formatUTCDateForDisplay(currentProfile.dateOfBirth) : 'Not set'}
          </Text>
        )}
      </View>

      {/* NEW: Gender Field */}
      <View style={{ marginBottom: 15 }}>
        <Text style={styles.text}>Gender</Text>
        {isEditing ? (
          <RNPickerSelect
            onValueChange={(value: string | null) => handleInputChange('gender', value)}
            items={genderOptions}
            value={formData.gender}
            style={pickerSelectStyles}
            placeholder={{ label: 'Select your gender', value: null }}
          />
        ) : (
          <Text style={styles.valueText}>
            {currentProfile?.gender || 'Not set'}
          </Text>
        )}
      </View>

      {/* NEW: Blood Type Field */}
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.text}>Blood Type</Text>
        {isEditing ? (
          <View style={styles.bloodTypeContainer}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <RNPickerSelect
                onValueChange={(value: string | null) => handleInputChange('bloodTypeLetter', value)}
                items={bloodTypeLetterOptions}
                value={formData.bloodTypeLetter}
                style={pickerSelectStyles}
                placeholder={{ label: 'Group', value: null }}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <RNPickerSelect
                onValueChange={(value: string | null) => handleInputChange('bloodTypeRh', value)}
                items={bloodTypeRhOptions}
                value={formData.bloodTypeRh}
                style={pickerSelectStyles}
                placeholder={{ label: 'Rh Factor', value: null }}
              />
            </View>
          </View>
        ) : (
          <Text style={styles.valueText}>
            {formatBloodTypeForDisplay(currentProfile?.bloodTypeLetter, currentProfile?.bloodTypeRh)}
          </Text>
        )}
      </View>
      
      <View>
        <TouchableOpacity style={styles.button} onPress={handleEditToggle}>
          <Text style={styles.buttonText}>{isEditing ? 'Save Profile' : 'Edit Profile'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    flex: 1,
    backgroundColor: '#F5F0F6',
    paddingTop: 16,
  },
  text: {
    color: '#6C4386',
    fontSize: 14,
  },
  valueText: {
    color: '#020202',
    fontSize: 16,
    marginTop: 4,
  },
  input: {
    color: '#020202',
    borderColor: '#6C4386',
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    marginTop: 4,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6C4386',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#F5F0F6',
    fontSize: 16,
    fontWeight: 'bold',
  },
    bloodTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#6C4386',
    borderRadius: 24,
    color: '#020202',
    marginTop: 4,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14, // Adjusted for Android
    borderWidth: 1,
    borderColor: '#6C4386',
    borderRadius: 24,
    color: '#020202',
    marginTop: 4,
  },
  placeholder: {
    color: '#8E8E93',
  },
});