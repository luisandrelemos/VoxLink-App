import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import useHaptics from '../../utils/useHaptics';

export default function BottomNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const triggerHaptic = useHaptics();

  const isActive = (path: string) => pathname === path;

  return (
    <View style={styles.navBar}>
      {/* Home */}
      <TouchableOpacity
        onPress={() => {
          if (!isActive('/home')) {
            triggerHaptic();
            router.replace('/home');
          }
        }}
      >
        <View style={styles.navItem}>
          <Image
            source={require('../../assets/images/nav-home.png')}
            style={[styles.navIcon, isActive('/home') && styles.active]}
          />
          {isActive('/home') && <View style={styles.navIndicator} />}
        </View>
      </TouchableOpacity>

      {/* Profile */}
      <TouchableOpacity
        onPress={() => {
          if (!isActive('/account')) {
            triggerHaptic();
            router.replace('/account');
          }
        }}
      >
        <View style={styles.navItem}>
          <Image
            source={require('../../assets/images/nav-profile.png')}
            style={[styles.navIcon, isActive('/account') && styles.active]}
          />
          {isActive('/account') && <View style={styles.navIndicator} />}
        </View>
      </TouchableOpacity>

      {/* Logo central */}
      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.navLogo}
      />

      {/* Settings */}
      <TouchableOpacity
        onPress={() => {
          if (!isActive('/settings')) {
            triggerHaptic();
            router.replace('/settings');
          }
        }}
      >
        <View style={styles.navItem}>
          <Image
            source={require('../../assets/images/nav-settings.png')}
            style={[styles.navIcon, isActive('/settings') && styles.active]}
          />
          {isActive('/settings') && <View style={styles.navIndicator} />}
        </View>
      </TouchableOpacity>

      {/* Info */}
      <TouchableOpacity
        onPress={() => {
          if (!isActive('/info')) {
            triggerHaptic();
            router.replace('/info');
          }
        }}
      >
        <View style={styles.navItem}>
          <Image
            source={require('../../assets/images/nav-info.png')}
            style={[styles.navIcon, isActive('/info') && styles.active]}
          />
          {isActive('/info') && <View style={styles.navIndicator} />}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
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
  active: {
    tintColor: '#fff',
  },
  navIndicator: {
    width: 6,
    height: 6,
    backgroundColor: '#fff',
    borderRadius: 3,
    marginTop: 4,
  },
});