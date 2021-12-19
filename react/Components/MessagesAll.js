import React, { Component } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import firebase from '@react-native-firebase/app';

function Chat({ username, data, navigation }) {
    var displayMessage = data.lastMessage;
    if (displayMessage.length >= 40) {
        var displayRaw = data.lastMessage.substring(0, 40);
        var idx = displayRaw.lastIndexOf(' ');
        if (idx != -1)
            displayMessage = displayRaw.substring(0, idx) + '...';
    }
    
    var timeSent = new Date(data.lastMessageTime);
    var hours = timeSent.getHours();
    var minutes = timeSent.getMinutes();
    var amPM = hours < 12 ? 'AM' : 'PM';
    hours = hours % 12;
    hours = hours == 0 ? 12 : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var time = `${hours}:${minutes} ${amPM}`;

    return (
        <TouchableOpacity
            style={chatStyle.container}
            onPress={() => navigation.navigate('Message', { username: username, toUsername: data.toUsername })}
        >
            <View style={chatStyle.layoutContainer}>
                <View>
                    <Text style={chatStyle.contact}>{data.toUsername}</Text>
                    <Text style={chatStyle.lastMessage}>{displayMessage}</Text>
                </View>
                <View style={chatStyle.right}>
                    <Text>{time}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

class MessagesAll extends Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            chats: [],
            refreshing: false
        };
    }

    handleRefresh = () => {
        this.setState({
            refreshing: true
        }, () => this.makeRequest());
    }

    makeRequest = () => {
        fetch(`http://localhost:3000/${this.state.username}`, {
            method: 'GET'
        })
        .then(res => res.json())
        .then(resJson => {
            this.setState({ chats: resJson.chats, refreshing: false });
        })
        .catch(err => {
            console.log(err);
            this.setState({ refreshing: false });
        });
    }

    componentDidMount() {
        var { currentUser } = firebase.auth();
        this.setState({ username: currentUser.displayName }, () => this.makeRequest());

        this.props.navigation.setOptions({
            headerRight: () => (
                <View style={{ right: -12 }}>
                    <Button
                        title='+'
                        onPress={() => this.props.navigation.navigate('MessageNew', { username: this.state.username })} />
                </View>
            ),
            headerLeft: () => (
                <View style={{ left: -15 }}>
                    <Button
                        title="•••"
                        onPress={() => {
                            Alert.alert(
                                'Log Out',
                                'Do you want to continue?',
                                [{
                                    text: 'Cancel',
                                    onPress: () => {},
                                    style: 'cancel'
                                },
                                {
                                    text: 'Yes, Log Out',
                                    onPress: () => firebase.auth().signOut(),
                                    style: 'destructive'
                                }]
                            );   
                        }} />
                </View>
            )
        });
    }

    renderSeparator = () => {
        return (
            <View
                style={{
                    height: 1.5,
                    width: "100%",
                    backgroundColor: "#CED0CE",
                    alignSelf: 'center'
                }}
            />
        );
    };

    render() {
        return (
            <View style={styles.container}>
                <FlatList
                    keyExtractor={chat => chat.toUsername}
                    data={this.state.chats}
                    renderItem={({item}) => <Chat data={item} username={this.state.username} navigation={this.props.navigation} />}
                    ItemSeparatorComponent={this.renderSeparator}
                    refreshing={this.state.refreshing}
                    onRefresh={this.handleRefresh}
                />
            </View>
        );
    }
}

const chatStyle = StyleSheet.create({
    container: {
        height: 80
    },
    contact: {
        fontSize: 20,
        marginBottom: 4
    },
    lastMessage: {
        fontSize: 15
    },
    layoutContainer: {
        display: 'flex',
        flexDirection: 'row',
        margin: 10
    },
    right: {
        position: 'absolute',
        right: 10,
        top: 20,
    }
});

const styles = StyleSheet.create({
    container: {
        width: '100%',
        minHeight: '100%'
    }
});

export default MessagesAll;