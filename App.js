import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack'
import Tabs from './component/tabs';
import RegisterScreen from './screens/register';
import LoginScreen from './screens/login';
import HomeScreen from './screens/home';
import ProfileScreen from './screens/profile';
import RestaurantDetailScreen from './screens/RestaurantDetailScreen';
import * as SecureStore from 'expo-secure-store';
import ReservationScreen from './screens/reservation';
import EditProfileScreen from './screens/edit_profile';
import PasswordResetScreen from './screens/resetPassword';
import PasswordNewScreen from './screens/passwordnew';
import OTPVerificationScreen from './screens/verifyOTP';
import MenuTableScreen from './screens/menuTable';
import MenuListScreen from './screens/menuList';
import MenuChooseTableScreen from './screens/menuChooseTable';
import MenuAddonScreen from './screens/menuAddon';
import ReservationListScreen from './screens/reservationList';
import ReservationDetailScreen from './screens/reservationDetail';
import ChatScreen from './screens/chat';
import { NotificationProvider } from './screens/notification';
import FlashMessage from 'react-native-flash-message';
const Stack = createStackNavigator();



const App = () => {
  const [UserAuth, setUserAuth] = useState((""));


  const getLoginInformation = async () => {
    try {

      user = await SecureStore.getItemAsync('userAuth');
      setUserAuth(user)

    } catch (e) {
      console.log(e)
    };
  };

  useEffect(() => {
    getLoginInformation();


  }, []);

  return (
    <NavigationContainer>
      <NotificationProvider>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#ff8a24' },
            headerTintColor: 'white',
            headerTitleAlign: 'center'
          }}>
          <Stack.Screen name="tab" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name='profile' component={ProfileScreen} options={{ headerShown: false }} />
          <Stack.Screen name='reserve' component={ReservationScreen} />
          <Stack.Screen name='EditProfile' component={EditProfileScreen} />
          <Stack.Screen name='forgotPassword' component={PasswordResetScreen} />
          <Stack.Screen name='editPassword' component={PasswordNewScreen} />
          <Stack.Screen name='OTPVerification' component={OTPVerificationScreen} />
          <Stack.Screen name='menuTable' component={MenuTableScreen} />
          <Stack.Screen name='menuList' component={MenuListScreen} />
          <Stack.Screen name='chooseTable' component={MenuChooseTableScreen} />
          <Stack.Screen name='menuAddon' component={MenuAddonScreen} />
          <Stack.Screen name='reservationList' component={ReservationListScreen} />
          <Stack.Screen name='reservationDetail' component={ReservationDetailScreen} />
          <Stack.Screen name='Chat' component={ChatScreen} />
          <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} options={({ route }) => ({ title: route.params.restaurantName })} />
        </Stack.Navigator>
        <FlashMessage position="top" />
      </NotificationProvider>
    </NavigationContainer>
  );
}



export default App
