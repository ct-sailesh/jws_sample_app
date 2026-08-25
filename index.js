/**
 * @format
 */

// Must be the very first import — see react-native-gesture-handler's setup docs.
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
