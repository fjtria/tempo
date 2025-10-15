import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useQuery, useRealm } from '@realm/react';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Profile } from '../../models/Profile';

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [genderOpen, setGenderOpen] = useState(false);
  const [bloodLetterOpen, setBloodLetterOpen] = useState(false);
  const [bloodRhOpen, setBloodRhOpen] = useState(false);
  const realm = useRealm();
  const savedProfile = useQuery(Profile);

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

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

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

  // UTC date formatter
  const formatUTCDateForDisplay = (date: Date | null): string => {
    if (!date) return 'Select a date';
    
    const year = date.getUTCFullYear();
    const month = monthNames[date.getUTCMonth()];
    const day = date.getUTCDate();

    return `${month} ${day}, ${year}`;
  };

  // Local date formatter
  const formatLocalDateForDisplay = (date: Date | null): string => {
    if (!date) return 'Select a date';
    
    const year = date.getFullYear();
    const month = monthNames[date.getMonth()];
    const day = date.getDate();

    return `${month} ${day}, ${year}`;
  };

  const age = 23;

  const onGenderOpen = useCallback(() => {
    setBloodLetterOpen(false);
    setBloodRhOpen(false);
  }, []);

  // Combined blood type (letter + RH) formatter
  const formatBloodTypeForDisplay = (
    letter: string | null | undefined,
    rh: string | null | undefined
  ): string => {
    if (letter && rh) return `${letter}${rh}`;
    if (letter) return letter;
    if (rh) return rh;
    return 'Not set';
  };

  const onBloodLetterOpen = useCallback(() => {
    setGenderOpen(false);
    setBloodRhOpen(false);
  }, []);

  const onBloodRhOpen = useCallback(() => {
    setGenderOpen(false);
    setBloodLetterOpen(false);
  }, []);
  
  // Displays profile data
  useEffect(() => {
    if (savedProfile.length > 0) {
      const profile = savedProfile[0];
      setCurrentProfile(profile);

      let birthdayForForm: Date | null = null;
      // Convert the stored UTC date to a local date for the picker
      if (profile.dateOfBirth) {
        const utcDate = profile.dateOfBirth;
        birthdayForForm = new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate());
      }

      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        birthday: birthdayForForm,
        gender: profile.gender ?? null,
        bloodTypeLetter: profile.bloodTypeLetter ?? null,
        bloodTypeRh: profile.bloodTypeRh ?? null,
      });
    }
  }, [savedProfile]);

  // Saves profile changes to database
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
        currentProfile.gender = formData.gender || undefined;
        currentProfile.bloodTypeLetter = formData.bloodTypeLetter || undefined;
        currentProfile.bloodTypeRh = formData.bloodTypeRh || undefined;
      } else {
        realm.create('Profile', {
          _id: new Realm.BSON.ObjectId(),
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: dateOfBirth,
          gender: formData.gender || undefined,
          bloodTypeLetter: formData.bloodTypeLetter || undefined,
          bloodTypeRh: formData.bloodTypeRh || undefined,
        });
      }
    });
    setIsEditing(false);
    Alert.alert('Success', 'Profile saved successfully!');
  };

  // Handles correct birthdate saving
  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (event.type === 'set' && selectedDate) {
      // Normalize the date to be at midnight local time
      const normalizedDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      );
      handleInputChange('birthday', normalizedDate);
    }
  };

  // Handles form changes
  const handleInputChange = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handles edit profile button
  const handleEditToggle = () => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
    }
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
            placeholder="First Name"
          />
        ) : (
          <Text style={styles.valueText}>
            {currentProfile?.firstName || 'Not set'}
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
            placeholder="Last Name"
          />
        ) : (
          <Text style={styles.valueText}>
            {currentProfile?.lastName || 'Not set'}
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
                {formatLocalDateForDisplay(formData.birthday)}
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
            {currentProfile?.dateOfBirth ? formatUTCDateForDisplay(currentProfile.dateOfBirth) : 'Not set'} ({age})
          </Text>
        )}
      </View>

      {/* Gender Field */}
      <View style={{ marginBottom: 15, zIndex: 999 }}>
        <Text style={styles.text}>Gender</Text>
        {isEditing ? (
          <DropDownPicker
            open={genderOpen}
            value={formData.gender}
            items={genderOptions}
            setOpen={setGenderOpen}
            setValue={(callback) => {
              handleInputChange('gender', callback(formData.gender));
            }}
            onOpen={onGenderOpen}
            placeholder="Gender"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
          />
        ) : (
          <Text style={styles.valueText}>
            {currentProfile?.gender || 'Not set'}
          </Text>
        )}
      </View>

      {/* Blood Type Field */}
      <View style={{ marginBottom: 20, zIndex: 99 }}>
        <Text style={styles.text}>Blood Type</Text>
        {isEditing ? (
          <View style={styles.bloodTypeContainer}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <DropDownPicker
                open={bloodLetterOpen}
                value={formData.bloodTypeLetter}
                items={bloodTypeLetterOptions}
                setOpen={setBloodLetterOpen}
                setValue={(callback) => {
                  handleInputChange('bloodTypeLetter', callback(formData.bloodTypeLetter));
                }}
                onOpen={onBloodLetterOpen}
                placeholder="Blood ABO"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <DropDownPicker
                open={bloodRhOpen}
                value={formData.bloodTypeRh}
                items={bloodTypeRhOptions}
                setOpen={setBloodRhOpen}
                setValue={(callback) => {
                  handleInputChange('bloodTypeRh', callback(formData.bloodTypeRh));
                }}
                onOpen={onBloodRhOpen}
                placeholder="Blood Rh"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
              />
            </View>
          </View>
        ) : (
          <Text style={styles.valueText}>
            {formatBloodTypeForDisplay(currentProfile?.bloodTypeLetter, currentProfile?.bloodTypeRh)}
          </Text>
        )}
      </View>
      
      {/* Edit/Save Profile Button */}
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
  dropdown: {
    borderColor: '#6C4386',
    marginTop: 4,
  },
  dropdownContainer: {
    borderColor: '#6C4386',
  },
});