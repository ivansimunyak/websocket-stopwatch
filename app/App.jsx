import { registerRootComponent } from 'expo';
import { View, Text } from 'react-native';
import StopwatchComponent from './StopwatchComponent'
import { TextDecoder, TextEncoder } from 'text-encoding';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;

function App() {
  return (
    <GestureHandlerRootView>
        <StopwatchComponent></StopwatchComponent>
    </GestureHandlerRootView>
  )
}

registerRootComponent(App);
