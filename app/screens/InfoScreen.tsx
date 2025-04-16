import { View, Text } from 'react-native';
import BottomNavBar from '../components/BottomNavBar';

export default function InfoScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Info Screen</Text>

      <BottomNavBar/>
    </View>
  );
}
