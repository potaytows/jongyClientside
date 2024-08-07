import React, { createContext, useContext, useEffect } from 'react';
import { showMessage } from 'react-native-flash-message';
import io from 'socket.io-client';
import { useNavigationState } from '@react-navigation/native';
import { Image, StyleSheet } from 'react-native';

const apiheader = process.env.EXPO_PUBLIC_apiURI;
const socket = io(apiheader);

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
 
  
  useEffect(() => {
    const handleNotification = (data) => {
      console.log('Notification received:', data);
     
        showMessage({
          
          message: data.restaurant ,
          description: data.message,
          type: 'info',
          icon: ({ style }) => (
            <Image
              style={[style, styles.image]}
              source={{ uri: apiheader+'/image/getRestaurantIcon/'+data.restaurantID }}
            />
          ),
          duration: 5000,
          backgroundColor: "gray",
        });
      
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, []);

  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);

const styles = StyleSheet.create({
  image: {
    width: 24,
    height: 24,
    borderRadius: 12, 
  },
});