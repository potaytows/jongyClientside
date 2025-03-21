import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import Text from '../component/Text';


const apiheader = process.env.EXPO_PUBLIC_apiURI;

const MenuChooseTableScreen = ({ route, navigation }) => {
    const [selectedTables, setSelectedTables] = useState([]);

    const handleMenuChooseTable = (selectedTable) => {
        navigation.navigate('menuList', {
            restaurantId: route.params.restaurantId,
            restaurant: route.params.restaurant,
            selectedTables: [selectedTable],
            navigationSource: route.params.navigationSource,
            startTime:route.params.startTime,
            endTime:route.params.endTime
        });
    };

    useEffect(() => {
        setSelectedTables(route.params.selectedTables || []);
    }, []);

    return (
            <ScrollView style={styles.container} >
                <View style={styles.container}>
                    <View style={styles.restaurantContainer}>
                        {selectedTables.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.button}
                                onPress={() => handleMenuChooseTable(item)}
                            >
                                <Text style={styles.textChooseTable}>{item.text}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:'white'

    },
    restaurantContainer: {
        flex: 1,
        margin: 20,
        justifyContent: 'center',
        alignItems: 'center',
        

       

    },
    button: {
        backgroundColor: '#FF914D',
        width: '40%',
        padding: 10,
        borderRadius: 5,
        marginTop: 15
    },
    textChooseTable: {
        color: 'white',
        textAlign: 'center',
    },
});

export default MenuChooseTableScreen;
