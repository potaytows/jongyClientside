import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import Checkbox from 'expo-checkbox';
import * as SecureStore from 'expo-secure-store';


const apiheader = process.env.EXPO_PUBLIC_apiURI;

const MenuAddonScreen = ({ route, navigation }) => {
    const [selectedTables, setSelectedTables] = useState([]);
    const [selectedMenuItem, setSelectedMenuItem] = useState(null);
    const [addons, setAddons] = useState([]);
    const [checkedItems, setCheckedItems] = useState(Array(addons.length).fill(false));


    const fetchAddons = async () => {
        try {
            const response = await axios.get(`${apiheader}/addons/getAddOnByMenuID/${selectedMenuItem._id}`);
            const result = await response.data;
            setAddons(result);
            setCheckedItems(Array(result.length).fill(false));
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        setSelectedMenuItem(route.params.selectedMenuItem);
        setSelectedTables(route.params.selectedTables || []);
    }, [route.params.selectedMenuItem, route.params.selectedTables]);

    useEffect(() => {
        if (selectedMenuItem) {
            fetchAddons();

        }
    }, [selectedMenuItem]);


    const handleCheckboxChange = (index) => {
        const newCheckedItems = [...checkedItems];
        newCheckedItems[index] = !newCheckedItems[index];
        setCheckedItems(newCheckedItems);
    };

    const handleAddCart = async () => {
        const selectedAddons = addons.filter((addon, index) => checkedItems[index]);
        const login = await JSON.parse(await SecureStore.getItemAsync("userCredentials"));
        const username = login.username
        const cartData = {
            restaurantId: route.params.restaurantId,
            selectedTables: selectedTables.map(table => ({ _id: table._id, tableName: table.tableName })),
            selectedMenuItem: {
                _id: selectedMenuItem._id,
                menuName: selectedMenuItem.menuName,
                price: selectedMenuItem.price,
            },
            selectedAddons: selectedAddons.map(addon => ({ _id: addon._id, AddOnName: addon.AddOnName, price: addon.price })),
            OrderTableType: route.params.navigationSource,
            username: username,
            Count: 1
        };


        try {
            await axios.post(apiheader + '/cart/addToCart', cartData);
            console.log('Cart data added successfully!');
        } catch (error) {
            console.error('Error adding cart data: ', error);
        }
        navigation.navigate('reserve',
            {
                restaurantId: route.params.restaurantId,
                navigationSource: route.params.navigationSource,
                selectedTables: selectedTables,
            });
    };






    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {selectedMenuItem && (
                    <Image style={styles.backgroundImage} source={{ uri: apiheader + '/image/getMenuIcon/' + selectedMenuItem._id }} />
                )}
            </View>
            {route.params.navigationSource === 'OrderTogether' ? (
                <Text style={styles.selectedTablesText}>รวมโต๊ะ</Text>
            ) : null}
            {route.params.navigationSource === 'SingleTable' ? (
                <Text style={styles.selectedTablesText}>
                    โต๊ะ {selectedTables.map((table) => table.tableName).join(', ')}
                </Text>
            ) : null}
            <View style={styles.restaurantListContainer}>
                {selectedMenuItem && (
                    <View style={styles.menuContainer}>
                        <View style={styles.menuShow}>
                            <View style={styles.TextContaine}>
                                <Text style={styles.menuName}>{selectedMenuItem.menuName}</Text>
                            </View>
                            <View style={styles.TextContaine}>
                                <Text style={styles.price}>{selectedMenuItem.price}</Text>
                                <Text style={styles.pricestart}>ราคาเริ่มต้น</Text>

                            </View>
                        </View>
                        <Text style={styles.addons}>เพิ่มเติม</Text>
                        {addons && addons.map((addon, index) => (
                            <View key={addon._id} style={styles.section}>

                                <View style={styles.TextContaineFlex}>
                                    <Checkbox
                                        style={styles.checkbox}
                                        value={checkedItems[index]}
                                        onValueChange={() => handleCheckboxChange(index)}
                                    />
                                    <Text style={styles.paragraph}>{addon.AddOnName}</Text>
                                </View>
                                <View style={styles.TextContaine}>
                                    <Text style={styles.paragraph2}>+{addon.price}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </View>
            <TouchableOpacity style={styles.buttonReserve} onPress={handleAddCart}>
                <Text style={styles.buttonText}>เพิ่มในตระกร้า</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    header: {
        width: '100%',
        height: "22%",
    },
    restaurantListContainer: {
        flex: 1,
        flexDirection: 'row',
        marginTop: 5
    },
    backgroundImage: {
        width: '100%',
        height: "100%",
    },
    selectedTablesText: {
        textAlign: 'center',
        marginTop: 10,
        fontSize: 18,
        fontWeight: 'bold',
    },
    TextContaine: {
        width: '50%',
    },
    TextContaineFlex: {
        width: '50%',
        fontSize: 15,
        flexDirection: 'row',

    },
    menuName: {
        fontSize: 20,
        marginBottom: 8,
        marginLeft: 15
    },
    price: {
        fontSize: 25,
        color: '#FF66AB',
        fontWeight: 'bold',
        textAlign: 'right',
        marginRight: 15


    },
    section: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
        borderBottomColor: '#DDDDDD',
        borderBottomWidth: 1

    },
    menuContainer: {
        width: '100%',

    },
    menuShow: {
        width: '100%',
        flexDirection: 'row',
        borderBottomWidth: 5,
        borderBottomColor: '#E2E2E2',
    },
    addons: {
        marginLeft: 15,
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10

    },
    paragraph: {
        marginLeft: 10
    },
    paragraph2: {
        fontSize: 15,
        textAlign: 'right',
        marginRight: 15
    },
    checkbox: {
        borderRadius: 50,
        marginLeft: 15,
        marginBottom: 10
    },
    pricestart: {
        textAlign: 'right',
        marginRight: 15,
        marginBottom: 10

    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold'
    },
    buttonReserve: {
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#FF914D',
        padding: 10,
        borderRadius: 5,
        alignSelf: 'center',
        width: '95%',
        marginBottom: 10

    },
});

export default MenuAddonScreen;
