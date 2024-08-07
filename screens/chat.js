import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import io from 'socket.io-client';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { reduce } from 'lodash';

const apiheader = process.env.EXPO_PUBLIC_apiURI;
const socket = io(apiheader);

const ChatScreen = ({ route }) => {
    const { reservationID } = route.params;
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [visibleTimestamps, setVisibleTimestamps] = useState({});
    const [restaurant, setRestaurant] = useState(null);
    const scrollViewRef = useRef();

    useEffect(() => {
        const fetchChatMessages = async () => {
            try {
                const response = await axios.get(apiheader + '/chat/newChat/' + reservationID);
                setMessages(response.data.obj.messages || []);
                setRestaurant(response.data.obj.restaurant || null);
                console.log(messages)
            } catch (error) {
                console.error(error);
            }
        };

        fetchChatMessages();
    }, [reservationID]);


    useFocusEffect(
        React.useCallback(() => {
            const userType = "customer";
            console.log('Joining room:', reservationID);
            socket.emit('joinRoom', reservationID, userType);

            socket.on('message', (message) => {
                console.log('Received message:', message);
                setMessages(prevMessages => [...prevMessages, message]);
            });

            socket.on('updateMessages', (updatedMessages) => {
                console.log('Received updated messages:', updatedMessages);
                setMessages(updatedMessages);
            });

            return () => {
                console.log('Leaving room:', reservationID);
                socket.emit('leaveRoom', reservationID);
                socket.off('message');
                socket.off('updateMessages');
            };
        }, [reservationID])
    );

    const sendMessage = async () => {
        if (newMessage.trim()) {
            console.log('Sending message:', newMessage);
            socket.emit('chatMessage', { reservationID, sender: 'customer', message: newMessage });
            setNewMessage('');
            console.log(messages)
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }
    };

    const showTime = (messageID) => {
        setVisibleTimestamps(prevState => ({ ...prevState, [messageID]: !prevState[messageID] }));
    };

    const groupMessages = (messages) => {
        const grouped = messages.reduce((acc, message) => {
            const prevGroup = acc.length > 0 ? acc[acc.length - 1] : null;
            const isSameSender = prevGroup && prevGroup.sender === message.sender;

            if (isSameSender) {
                prevGroup.messages.push(message);
            } else {
                acc.push({
                    sender: message.sender,
                    messages: [message]
                });
            }

            return acc;
        }, []);

        // Handle setting isFirst and isLast
        grouped.forEach(group => {
            if (group.messages.length > 1) {
                group.messages.forEach((message, index) => {
                    message.isFirst = index === 0;
                    message.isLast = index === group.messages.length - 1;
                });
            } else {
                // For groups with a single message, skip isFirst and isLast
                group.messages[0].isFirst = false;
                group.messages[0].isLast = false;
            }
        });

        // Mark groups that contain only one message
        grouped.forEach(group => {
            group.isOneOfGroup = group.messages.length === 1;
        });

        return grouped;
    };
    const groupedMessages = groupMessages(messages);

    return (
        <View style={styles.container}>
            <ScrollView ref={scrollViewRef}>
                {groupedMessages.length === 0 && <Text style={styles.loadingText}>No messages yet.</Text>}
                {groupedMessages.map((group, groupIndex) => (
                    <View key={groupIndex}>
                        {group.messages.map((item, index) => (
                            <View key={`${groupIndex}-${index}`} style={[styles.messageContainer, item.sender === 'restaurant' && { alignSelf: 'flex-start' }]}>
                                {item.sender === 'restaurant' && restaurant && (
                                    <View style={styles.flexChatCalling}>
                                        {item.isLast && (
                                            <View style={styles.image}>
                                                <Image style={styles.imagephoto} source={{ uri: `${apiheader}/image/getRestaurantIcon/${restaurant._id}` }} />
                                            </View>
                                        )}
                                        {group.isOneOfGroup && (
                                            <View style={styles.image}>
                                                <Image style={styles.imagephoto} source={{ uri: `${apiheader}/image/getRestaurantIcon/${restaurant._id}` }} />
                                            </View>
                                        )}
                                        {!item.isLast && !group.isOneOfGroup && (
                                            <View style={styles.space}></View>
                                        )}
                                        {/* group.isOneOfGroup && */}
                                        <TouchableOpacity style={styles.chickTime} onPress={() => showTime(item._id)} >
                                            <Text style={[styles.messageText,
                                            item.sender === 'restaurant' && { backgroundColor: 'grey' },
                                            item.isLast && { borderTopLeftRadius: 10 },
                                            item.isFirst && { borderBottomLeftRadius: 10 },
                                            !group.isOneOfGroup && !item.isFirst && !item.isLast && { borderBottomLeftRadius: 10, borderTopLeftRadius: 10 },
                                            ]}>{item.message}</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                                {item.sender === 'customer' && (
                                    <View style={styles.showReadIt}>
                                        <View style={styles.IsReadIt}>
                                            {item.readStatus === 'notRead' && (<Text style={styles.ReadText}></Text>)}
                                            {item.readStatus === 'ReadIt' && (<Text style={styles.ReadText}>อ่านแล้ว</Text>)}
                                        </View>
                                        <TouchableOpacity style={styles.chickTime} onPress={() => showTime(item._id)}>
                                            <Text style={[styles.messageText,
                                            item.sender === 'restaurant' && { backgroundColor: 'grey' },
                                            item.isLast && { borderTopRightRadius: 10 },
                                            item.isFirst && { borderBottomRightRadius: 10 },
                                            !group.isOneOfGroup && !item.isFirst && !item.isLast && { borderBottomRightRadius: 10, borderTopRightRadius: 10 }
                                            ]}>{item.message}</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                                {visibleTimestamps[item._id] && (
                                    <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                )}
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>
            <View style={styles.sendChatContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Aa"
                    placeholderTextColor="white"
                    value={newMessage}
                    onChangeText={setNewMessage}
                />
                <TouchableOpacity style={styles.buttonSend} onPress={sendMessage}>
                    <Ionicons style={styles.sendIcon} name="send" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 70,
        padding: 10
    },
    messageContainer: {
        alignSelf: 'flex-end',
        maxWidth: '80%',
    },
    senderName: {
        textAlign: 'left',
        marginLeft: 10,
        color: 'gray'
    },
    messageText: {
        fontSize: 16,
        backgroundColor: '#FF914D',
        color: 'white',
        padding: 10,
        paddingLeft: 15,
        paddingRight: 15,
        borderRadius: 50,
        justifyContent: 'center',
    },
    timestamp: {
        fontSize: 10,
        color: 'gray',
        textAlign: 'right',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: 'gray',
    },
    sendChatContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
    },
    input: {
        flex: 8,
        backgroundColor: 'gray',
        padding: 10,
        marginLeft: 10,
        borderRadius: 50,
        color: 'white',
    },
    buttonSend: {
        flex: 1,
        justifyContent: 'center',
    },
    sendIcon: {
        textAlign: 'center',
        color: '#FF914D',
        fontSize: 25,
    },
    flexChatCalling: {
        flexDirection: 'row',
    },
    image: {
        width: 40,
        height: 40,
        backgroundColor: 'gray',
        borderRadius: 50
    },
    imagephoto: {
        width: '100%',
        height: '100%',
        borderRadius: 50
    },
    chickTime: {
        justifyContent: 'center',
        marginTop: 2,
        marginLeft: 5
    },
    space: {
        width: 40,
        height: 40,
        borderRadius: 50
    },
    showReadIt: {
        flexDirection: 'row',
        alignItems: 'flex-end' 
    },
    IsReadIt: {
    },
    ReadText: {
        textAlign: 'center',
        fontSize: 12,
        color:'#999999'
    }
});

export default ChatScreen;
