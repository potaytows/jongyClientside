import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Image, TextInput, Button, ScrollView, ToastAndroid } from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import AutoHeightImage from 'react-native-auto-height-image'
import _ from 'lodash';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Text from '../component/Text';
import StaticTable from '../component/staticTable';

function Menucontains(arr, key, val) {

  for (var i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) return true;
  }
  return false;
}

const apiheader = process.env.EXPO_PUBLIC_apiURI;

const RestaurantDetailScreen = ({ route, navigation }) => {
  const [obj, setData] = useState([]);
  const [selected, setSelected] = useState([]);
  const [request, setRequest] = useState('');
  const [restaurantDetails, setRestaurantDetails] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const CheckExistingOrder = async () => {

    const login = await JSON.parse(await SecureStore.getItemAsync("userCredentials"));
    const username = login.username
    const response = await axios.get(apiheader + '/cart/getCartByUsername/' + username + "/" + route.params.restaurantId);
    const result = await response.data;
    result.map((menu, index) => {
      if (menu.OrderTableType == "SingleTable") {
        const exists = selected.find((table) => table._id == menu.selectedTables[0]._id)
        if (!exists) {
          fetchDeleteCart(menu._id);
        }
      }
    })

  }
  const fetchDeleteCart = async (id) => {
    try {
      const response = await axios.get(apiheader + '/cart/deleteCart/' + id);
      const result = await response.data;

    } catch (error) {
      console.error(error);
    }
  };
  const checkLoginStatus = async () => {
    try {
      const userCredentials = await SecureStore.getItemAsync('userCredentials');

      if (userCredentials) {
        setIsLoggedIn(true);
        const user = JSON.parse(userCredentials);
        setUserInfo(user);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };

  const handlecomplete = async () => {
    if (!isLoggedIn) {
      navigation.navigate('profile');
    } else {
      navigation.navigate('reserve', {
        restaurantId: route.params.restaurantId,
        restaurantName: restaurantDetails.restaurantName,
        selectedTables: selected,
      });
    }
  };
  function compareObjs(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  const getTables = async () => {
    try {
      const response = await axios.get(apiheader + '/tables/getbyRestaurantId/' + route.params.restaurantId);
      const result = await response.data;
      setData(result.activePreset || []);
    } catch (error) {
      console.error(error);
    }
  };
  const fetchRestaurantDetails = async () => {
    try {
      const response = await axios.get(apiheader + '/restaurants/' + route.params.restaurantId);
      const result = await response.data;
      setRestaurantDetails(result);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    checkLoginStatus();
    getTables();

  }, []);
  useFocusEffect(
    React.useCallback(() => {
      fetchRestaurantDetails();

    }, [])
  );
  if (!restaurantDetails) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  const TableComponent = (props) => {
    const item = props.item
    if (item.type == "text") {
      return (
        <View style={[styles.container]}>
          <Text style={styles.text}>{item.text}</Text>
        </View>
      );

    }
    // ? backgroundColor:item.color:{}
    if (item.type == "shape") {
      return (
        <View style={[styles.container, { left: item.x, top: item.y }]}>
          <View style={[styles.shape, { height: item.height, width: item.width, backgroundColor: item.color }]}>
          </View>

        </View>
      );

    }
    if (item.type == "table") {
      if (contains(selected, item)) {
        return (
          <View style={styles.dragablecontent}>

            <TouchableOpacity onPress={() => removeSelected(item)} style={styles.dragable}>
              <View style={{ left: item.x, top: item.y }}>
                <View style={[styles.tablecontainer]}>
                  <Image
                    style={styles.image}
                    source={require('../assets/images/table.png')}
                    tintColor={"gray"}

                  />

                  <Text style={styles.text}>{item.text}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )
      } else {
        return (
          <View style={styles.dragablecontent}>

            <TouchableOpacity onPress={() => addSelected(item)}>
              <View style={{ left: item.x, top: item.y }}>
                <View style={[styles.tablecontainer]}>
                  <Image
                    source={require('../assets/images/table.png')}
                    style={styles.image}
                  />
                  <Text style={styles.text}>{item.text}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )
      }


    }

  }

  return (
    <View>
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.restaurantContainer}>
            <View style={styles.laoutlogoRes}>
              <Image style={styles.logoRes} source={{ uri: apiheader + '/image/getRestaurantIcon/' + restaurantDetails._id }} />
            </View>
            <Text style={styles.restaurantName}>{restaurantDetails.restaurantName}</Text>

          </View>
          <View style={styles.layoutGuid}>
            <View style={styles.flexGuid}>
              <FontAwesome name="circle" size={24} color="#FF7A00" />
              <Text style={styles.statusGuid}>ว่าง</Text>

              <FontAwesome name="circle" size={24} color="#C3F9C9" />
              <Text style={styles.statusGuid}>เลือก</Text>

              <FontAwesome name="circle" size={24} color="gray" />
              <Text style={styles.statusGuid}>เต็ม</Text>

            </View>
          </View>
          <View style={styles.dragablecontainer}>
            {obj.tables.map((item, index) => (
              <StaticTable item={item} key={index} selected={selected} setSelected={setSelected}/>
            ))}
          </View>
          <View style={styles.requestContainer} >
            <Text style={styles.help}>ความต้องการเพิ่มเติม</Text>
            <TextInput
              style={styles.input}
              value={request}
              onChangeText={text => setRequest(text)}
            />
          </View>
        </View>
      </ScrollView>
      <View style={styles.viewshow} >
        <Text style={styles.showtable}>
          โต๊ะที่เลือก: {selected.map((item, index) => (
            index == selected.length - 1 ? (
              <Text key={index} >{item.text}</Text>
            ) : (<Text key={index} >{item.text}, </Text>)

          ))}
        </Text>

        <TouchableOpacity style={styles.reserveButton} onPress={handlecomplete} >
          <Text style={styles.reserveButtonText}>ยืนยันการเลือกโต๊ะ</Text>
        </TouchableOpacity>
      </View>
    </View>


  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    position: 'relative',
    paddingBottom: 50
  },
  restaurantContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    paddingTop: 20,
    paddingBottom: 10,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,

    elevation: 5,
  },
  requestContainer: {
    marginLeft: 20,

  },
  laoutlogoRes: {
    width: 80,
    height: 100,
    marginLeft: 20
  },
  logoRes: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
    borderRadius: 5,
  },
  restaurantName: {
    marginLeft: 10,
    marginTop: 5,
    fontSize: 18,
    color: '#FF914D',
    fontWeight: 'bold'
  },
  reserveButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF914D',
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
  reserveButtonText: {
    color: '#fff',
  },
  input: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
    width: '70%',
    marginBottom: '20%'
  },
  help: {
    marginTop: 20
  },
  dragablecontainer: {
    width: 380,
    height: 450,
    alignSelf: 'center',
    marginTop: 40,
    borderWidth: 2,
    borderRadius: 5,
    marginBottom: 20,
    backgroundColor: 'white',
    borderColor: '#CCCCCC',
    overflow: 'hidden'

  },
  tablecontainer: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragablecontent: {
    position: 'absolute',
    justifyContent: 'center',
    alignSelf: 'center'


  },
  viewshow: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    height: '15%',
    width: '100%',
    borderTopWidth: 2,
    borderTopColor: '#E6E6E6'
  },
  showtable: {
    marginTop: 15,
    marginLeft: 10
  },
  image: {
    height: 30,
    width: 30
  },
  layoutGuid: {
    flex: 1,
    alignSelf: 'flex-end',
    marginLeft: 10,
    marginRight: 10
  },
  flexGuid: {
    marginTop: 15,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'gray',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10

  },
  statusGuid: {
    marginLeft: 10,
    marginRight: 10
  }


});



export default RestaurantDetailScreen;
