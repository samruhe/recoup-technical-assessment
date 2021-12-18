import React, { Component } from 'react';
import { Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import firebase from '@react-native-firebase/app';

function Chat({ username, data, navigation }) {
    var messageSent = new Date(data.lastMessageTime).toDateString();
    return (
        <TouchableOpacity
            style={chatStyle.container}
            onPress={() => navigation.navigate('Message', { username: username, toUsername: data.toUsername })}
        >
            <View style={chatStyle.layoutContainer}>
                <View>
                    <Text style={chatStyle.contact}>{data.toUsername}</Text>
                    <Text style={chatStyle.lastMessage}>{data.lastMessage}</Text>
                </View>
                <View style={chatStyle.right}>
                    <Text>{messageSent}</Text>
                    <Text style={chatStyle.contact}>&gt;</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

class MessagesAll extends Component {
    constructor(props) {
        super(props);

        this.state = {
            username: 'samruhe',
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
        // firebase.auth().signOut();
        // this.props.navigation.navigate('Loading');
        var { currentUser } = firebase.auth();
        this.setState({ username: currentUser.displayName }, () => this.makeRequest());

        this.props.navigation.setOptions({
            headerRight: () => (
                <Button
                    title='+'
                    onPress={() => this.props.navigation.navigate('MessageNew', { username: this.state.username })} />
            ),
            headerLeft: () => (
                <Button
                    title="Log Out"
                    onPress={() => firebase.auth().signOut()} />
            )
        });
    }

    renderSeparator = () => {
        return (
            <View
                style={{
                    height: 1,
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

const styles = StyleSheet.create({
    container: {
        width: '100%',
        minHeight: '100%'
    }
});

const chatStyle = StyleSheet.create({
    container: {
        height: 80
    },
    contact: {
        fontSize: 20
    },
    lastMessage: {
        fontSize: 15
    },
    layoutContainer: {
        display: 'flex',
        flexDirection: 'row'
    },
    right: {
        position: 'absolute',
        right: 10,
        flexDirection: 'row'
    }
});

export default MessagesAll;