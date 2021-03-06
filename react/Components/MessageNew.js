import React, { Component } from 'react';
import { Alert, Button, FlatList, KeyboardAvoidingView, StyleSheet, TextInput, View } from 'react-native';
import firebase from '@react-native-firebase/app';

import SingleMessage from './SingleMessage';

class MessageNew extends Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            messages: [],
            newMessage: '',
            contact: '',
            refreshing: false
        };
    }

    handleSendMessage = () => {
        fetch(`http://localhost:3000/${this.state.username}/${this.state.contact.trim()}/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: this.state.newMessage
            })
        })
        .then(res => res.json())
        .then(resJson => {
            if (resJson.status == 'SUCCESS') {
                this.setState({
                    messages: [...this.state.messages, { sentBy: this.state.username, message: this.state.newMessage, time: Date.now() }],
                    newMessage: ''
                }, () => this.makeRequest());
            }
            else {
                if (resJson.message === 'USER DOES NOT EXIST')
                    Alert.alert('User does not exist', 'Please make sure the recipent is entered correctly');
                else
                    Alert.alert('Network Request Failed', 'Please try again later');
            }
        })
        .catch(err => console.log(err));
    }

    handleRefresh = () => {
        this.setState({
            refreshing: true
        }, () => this.makeRequest());
    }

    makeRequest = () => {
        fetch(`http://localhost:3000/${this.state.username}/${this.state.contact}/messages`, {
            method: 'GET'
        })
        .then(res => res.json())
        .then(resJson => {
            this.setState({
                messages: resJson.messages,
                refreshing: false
            });
        })
        .catch(err => {
            console.log(err);
            this.setState({ refreshing: false });
        });
    }

    componentDidMount = () => {
        var { currentUser } = firebase.auth();
        this.setState({ username: currentUser.displayName });
    }

    render() {
        return (
            <KeyboardAvoidingView
                behavior='padding'
                keyboardVerticalOffset={92}
                style={styles.container}>
                <View style={newMessage.sendTo}>
                    <TextInput
                        style={newMessage.sendToInput}
                        placeholder="Send to..."
                        placeholderTextColor="gray"
                        onFocus={() => this.setState({ messages: [] })}
                        onChangeText={contact => this.setState({ contact })}
                        value={this.state.contact} />
                </View>
                <FlatList
                    inverted
                    data={this.state.messages}
                    contentContainerStyle={{ flexDirection: 'column-reverse' }}
                    renderItem={({ item }) => <SingleMessage messageInfo={item} username={this.state.username} /> }
                    refreshing={this.state.refreshing}
                    onRefresh={this.handleRefresh}
                />
                <View style={newMessage.container}>
                    <View style={newMessage.subContainer}>
                        <TextInput
                            style={newMessage.textInput}
                            placeholder="Message..."
                            placeholderTextColor="gray"
                            keyboardType="ascii-capable"
                            multiline
                            onChangeText={newMessage => this.setState({ newMessage })}
                            value={this.state.newMessage} />
                    </View>
                    <View style={newMessage.buttonContainer}>
                        <Button
                            title='Send'
                            disabled={this.state.newMessage.length === 0 || this.state.contact.length === 0}
                            onPress={this.handleSendMessage} />
                    </View>
                </View>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%'
    }
});

const newMessage = StyleSheet.create({
    buttonContainer: {
        justifyContent: 'center',
        right: 5,
        marginBottom: 20
    },
    container: {
        flexDirection: 'row',
        backgroundColor: '#A9A9A9',
        alignItems: 'center'
    },
    sendTo: {
        height: 45,
        borderBottomWidth: 1,
        borderBottomColor: 'gray'
    },
    sendToInput: {
        marginTop: 12,
        marginLeft: 10
    },
    subContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 20,
        marginRight: 10,
        flex: 4,
        margin: 10,
        marginBottom: 30
    },
    textInput: {
        flex: 1,
        marginHorizontal: 15,
        minHeight: 35,
        marginTop: 5
    }
});

export default MessageNew;