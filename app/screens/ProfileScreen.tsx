import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import * as ImagePicker from 'expo-image-picker';
import {
  getAuth,
  signOut,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import useHaptics  from '../../utils/useHaptics';
import { useSound } from '../../context/SoundContext';
import ScaledText   from '../components/ScaledText';

export default function ProfileScreen() {
  const { t }       = useTranslation();
  const router      = useRouter();
  const auth        = getAuth();
  const currentUser = auth.currentUser;
  const triggerHaptic = useHaptics();
  const { playClick } = useSound();

  const [user, setUser] = useState<{ name?:string; email:string; photoURL?:string }|null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName]           = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [imageUri, setImageUri]               = useState<string|null>(null);

  useEffect(() => {
    if (currentUser) {
      setUser({
        name:     currentUser.displayName || t('profile.defaultName'),
        email:    currentUser.email || '',
        photoURL: currentUser.photoURL ?? undefined
      });
    }
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1,1],
      quality: 0.6
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const saveChanges = async () => {
    try {
      if (!currentUser) return;

      if (newName || imageUri) {
        await updateProfile(currentUser, {
          displayName: newName || currentUser.displayName,
          photoURL:    imageUri || currentUser.photoURL
        });
      }

      if (newPassword) {
        if (!currentPassword) {
          Alert.alert(t('profile.error'), t('profile.needCurrentPassword'));
          return;
        }
        const cred = EmailAuthProvider.credential(currentUser.email!, currentPassword);
        await reauthenticateWithCredential(currentUser, cred);
        await updatePassword(currentUser, newPassword);
      }

      Alert.alert(t('profile.success'), t('profile.updated'));
      setModalVisible(false);
      setNewName(''); setCurrentPassword(''); setNewPassword('');
      setUser({
        name:     currentUser.displayName || '',
        email:    currentUser.email || '',
        photoURL: currentUser.photoURL ?? undefined
      });
    } catch (err:any) {
      Alert.alert(t('profile.error'), err.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
    router.replace('/initialmenuscreen');
  };

  const onPress = (cb:()=>void) => {
    triggerHaptic(); playClick(); cb();
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#191919" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={()=>onPress(()=>router.push('/home'))}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ScaledText base={16} style={styles.backText}>
            ← {t('profile.back')}
          </ScaledText>
        </TouchableOpacity>
        <Image source={require('../../assets/images/logo-header.png')} style={styles.logo}/>
      </View>

      {/* Perfil */}
      <View style={styles.content}>
        <Image
          source={ imageUri ? { uri:imageUri }
            : user?.photoURL ? { uri:user.photoURL }
            : require('../../assets/images/profile-placeholder.png')
          }
          style={styles.avatar}
        />
        <ScaledText base={18} style={styles.name}>
          {user?.name}
        </ScaledText>
        <ScaledText base={14} style={styles.email}>
          {user?.email}
        </ScaledText>

        <TouchableOpacity
          style={styles.buttonOutline}
          onPress={() => onPress(() => setModalVisible(true))}
        >
          <ScaledText base={18} style={styles.buttonOutlineText}>
            {t('profile.edit')}
          </ScaledText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonOutline}
          onPress={() => onPress(() => router.push('/usertypescreen'))}
        >
          <ScaledText base={18} style={styles.buttonOutlineText}>
            {t('profile.userType')}
          </ScaledText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSolid}
          onPress={() => onPress(logout)}
        >
          <ScaledText base={18} style={styles.buttonSolidText}>
            {t('profile.logout')}
          </ScaledText>
        </TouchableOpacity>
      </View>

      {/* Modal editar */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScaledText base={18} style={styles.modalTitle}>
              {t('profile.edit')}
            </ScaledText>

            <TouchableOpacity onPress={pickImage}>
              <Image
                source={ imageUri ? { uri:imageUri }
                  : user?.photoURL ? { uri:user.photoURL }
                  : require('../../assets/images/profile-placeholder.png')
                }
                style={styles.avatar}
              />
              <ScaledText base={13} style={styles.editPhoto}>
                {t('profile.changePhoto')}
              </ScaledText>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder={t('profile.newName')}
              placeholderTextColor="#000"
              value={newName}
              onChangeText={setNewName}
            />

            <TextInput
              style={styles.input}
              placeholder={t('profile.currentPassword')}
              placeholderTextColor="#000"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />

            <TextInput
              style={styles.input}
              placeholder={t('profile.newPassword')}
              placeholderTextColor="#000"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <TouchableOpacity style={styles.buttonSolid} onPress={saveChanges}>
              <ScaledText base={18} style={styles.buttonSolidText}>
                {t('profile.save')}
              </ScaledText>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginTop:15 }}
              onPress={() => onPress(()=>setModalVisible(false))}
            >
              <ScaledText base={14} style={{ color:'#fff', fontFamily:'Montserrat-Regular' }}>
                {t('profile.cancel')}
              </ScaledText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191919',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  backButton: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
  },
  backText: {
    color: '#fff',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
  },
  logo: {
    width: 110,
    height: 40,
    resizeMode: 'contain',
  },
  content: {
    alignItems: 'center',
    marginTop: 70,
    paddingHorizontal: 15,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 15,
    backgroundColor: '#333',
  },
  name: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    color: '#fff',
    marginBottom: 5,
  },
  email: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#aaa',
    marginBottom: 60,
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonOutlineText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
  },
  buttonSolid: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonSolidText: {
    color: '#000',
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
    fontFamily: 'Montserrat-Bold',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    fontFamily: 'Montserrat-Regular',
  },
  editPhoto: {
    color: '#aaa',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Montserrat-Regular',
  },
});
