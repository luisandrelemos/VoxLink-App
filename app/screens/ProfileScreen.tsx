import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, StatusBar,
  Modal, TextInput, Alert
} from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import * as ImagePicker from 'expo-image-picker';
import { getAuth, signOut, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useRouter } from 'expo-router';
import useHaptics from '../../utils/useHaptics';

export default function ProfileScreen() {
  const router = useRouter();
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const triggerHaptic = useHaptics();

  const [user, setUser] = useState<{ name?: string; email: string; photoURL?: string } | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setUser({
        name: currentUser.displayName || 'Utilizador',
        email: currentUser.email || '',
        photoURL: currentUser.photoURL ?? undefined
      });
    }
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });

    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      setImageUri(selectedUri);
    }
  };

  const handleSaveChanges = async () => {
    try {
      if (!currentUser) return;

      if (newName || imageUri) {
        await updateProfile(currentUser, {
          displayName: newName || currentUser.displayName,
          photoURL: imageUri || currentUser.photoURL,
        });
      }

      if (newPassword) {
        if (!currentPassword) {
          Alert.alert('Erro', 'Introduz a tua password atual para confirmar.');
          return;
        }

        const credential = EmailAuthProvider.credential(currentUser.email!, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);

        await updatePassword(currentUser, newPassword);
      }

      Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
      setModalVisible(false);
      setNewName('');
      setNewPassword('');
      setCurrentPassword('');
      setUser({
        name: currentUser.displayName || '',
        email: currentUser.email || '',
        photoURL: currentUser.photoURL ?? undefined
      });

    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/initialmenuscreen');
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#191919" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { router.push('/home'); triggerHaptic(); }}>
          <Text style={styles.backText}>← Minha Conta</Text>
        </TouchableOpacity>
        <Image source={require('../../assets/images/logo-header.png')} style={styles.logo} />
      </View>

      {/* Conteúdo */}
      <View style={styles.content}>
        <Image
          source={
            imageUri
              ? { uri: imageUri }
              : user?.photoURL
              ? { uri: user.photoURL }
              : require('../../assets/images/profile-placeholder.png')
          }
          style={styles.avatar}
        />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <TouchableOpacity style={styles.buttonOutline} onPress={() => { setModalVisible(true); triggerHaptic(); }}>
          <Text style={styles.buttonOutlineText}>Editar Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonOutline} onPress={triggerHaptic}>
          <Text style={styles.buttonOutlineText}>Preferências</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonSolid} onPress={() => { handleLogout(); triggerHaptic(); }}>
          <Text style={styles.buttonSolidText}>Terminar Sessão</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Edição */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>

            <TouchableOpacity onPress={() => { pickImage(); triggerHaptic(); }}>
              <Image
                source={
                  imageUri
                    ? { uri: imageUri }
                    : user?.photoURL
                    ? { uri: user.photoURL }
                    : require('../../assets/images/profile-placeholder.png')
                }
                style={styles.avatar}
              />
              <Text style={styles.editPhoto}>Alterar Foto</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Novo nome"
              placeholderTextColor="#000"
              value={newName}
              onChangeText={setNewName}
            />

            <TextInput
              style={styles.input}
              placeholder="Password atual"
              placeholderTextColor="#000"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />

            <TextInput
              style={styles.input}
              placeholder="Nova password"
              placeholderTextColor="#000"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <TouchableOpacity style={styles.buttonSolid} onPress={() => { handleSaveChanges(); triggerHaptic(); }}>
              <Text style={styles.buttonSolidText}>Guardar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setModalVisible(false); triggerHaptic(); }} style={{ marginTop: 15 }}>
              <Text style={{ color: '#fff', fontFamily: 'Montserrat-Regular' }}>Cancelar</Text>
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
