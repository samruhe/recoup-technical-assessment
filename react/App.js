import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MessagesAll from './Components/MessagesAll';
import Message from './Components/Message';
import MessageNew from './Components/MessageNew';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRoutName='MessageList'
        screenOptions={{
          headerBackTitle: ''
        }}>
        <Stack.Screen name='MessageList' component={MessagesAll} options={{ title: 'Messages' }} />
        <Stack.Screen
          name='Message'
          component={Message}
          options={({ route }) => ({
            title: route.params.toUsername
          })} />
        <Stack.Screen
          name='MessageNew'
          component={MessageNew}
          options={{
            title: 'New Message',
            headerBackTitle: 'Cancel'
          }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
