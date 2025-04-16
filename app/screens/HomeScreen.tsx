import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Dimensions, StatusBar } from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#191919" barStyle="light-content" />

      <View style={styles.scrollContainer}>
        {/* Logo no topo */}
        <Image source={require('../../assets/images/logo-header.png')} style={styles.logo} />

        {/* Bloco: Speech-to-Text */}
        <TouchableOpacity style={styles.block}>
          <Image source={require('../../assets/images/stt-icon.png')} style={styles.blockImage} />
          <Text style={styles.blockLabel}>Speech-to-Text</Text>
        </TouchableOpacity>

        {/* Bloco: Text-to-Speech */}
        <TouchableOpacity style={styles.block}>
          <Image source={require('../../assets/images/tts-icon.png')} style={styles.blockImage} />
          <Text style={styles.blockLabel}>Text-to-Speech</Text>
        </TouchableOpacity>

        {/* Bloco: Comunicação Rápida */}
        <TouchableOpacity style={styles.block}>
          <Image source={require('../../assets/images/list-icon.png')} style={styles.blockImage} />
          <Text style={styles.blockLabel}>Comunicação Rápida</Text>
        </TouchableOpacity>

        {/* Bloco: Acessibilidade */}
        <TouchableOpacity style={styles.block}>
          <Image source={require('../../assets/images/accessibility-icon.png')} style={styles.blockImage} />
          <Text style={styles.blockLabel}>Acessibilidade</Text>
        </TouchableOpacity>
      </View>

      {/* Navegação inferior */}
      <View style={styles.navBar}>
        <Image source={require('../../assets/images/nav-home.png')} style={styles.navIcon} />
        <Image source={require('../../assets/images/nav-profile.png')} style={styles.navIcon} />
        <Image source={require('../../assets/images/logo.png')} style={styles.navLogo} />
        <Image source={require('../../assets/images/nav-settings.png')} style={styles.navIcon} />
        <Image source={require('../../assets/images/nav-info.png')} style={styles.navIcon} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191919',
  },
  scrollContainer: {
    paddingTop: 40,
    paddingBottom: 100,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
    marginBottom: 20,
    marginTop: -40,
  },
  block: {
    marginBottom: 10,
    width: width - 60,
    alignItems: 'center',
  },
  blockImage: {
    width: 300,
    height: 120,
    resizeMode: 'contain',
    alignSelf: 'center', 
  },
  blockLabel: {
    color: '#fff',
    marginTop: 2,
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  navBar: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#353535',
    width: '100%',
    height: 60,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  navIcon: {
    width: 30,
    height: 30,
    tintColor: '#fff',
    resizeMode: 'contain',
  },
  navLogo: {
    width: 55,
    height: 55,
    resizeMode: 'contain',
  },
});
