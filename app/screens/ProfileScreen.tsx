import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import BottomNavBar from '../components/BottomNavBar';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#191919" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/home')}>
          <Text style={styles.backText}>← Minha Conta</Text>
        </TouchableOpacity>
        <Image
          source={require('../../assets/images/logo-header.png')}
          style={styles.logo}
        />
      </View>

      {/* Conteúdo principal */}
      <View style={styles.content}>
        <Image
          source={require('../../assets/images/profile-placeholder.png')}
          style={styles.avatar}
        />
        <Text style={styles.name}>Your Name</Text>
        <Text style={styles.email}>youremail@email.com</Text>

        {/* Botões */}
        <TouchableOpacity style={styles.buttonOutline}>
          <Text style={styles.buttonOutlineText}>Editar Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonOutline}>
          <Text style={styles.buttonOutlineText}>Preferências</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonSolid}>
          <Text style={styles.buttonSolidText}>Terminar Sessão</Text>
        </TouchableOpacity>
      </View>

      <BottomNavBar/>
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
});