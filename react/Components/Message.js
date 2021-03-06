import React, { Component } from 'react';
import { Button, FlatList, KeyboardAvoidingView, StyleSheet, TextInput, View } from 'react-native';

import SingleMessage from './SingleMessage';

class Message extends Component {
    constructor(props) {
        super(props);

        this.state = {
            username: props.route.params.username,
            toUsername: props.route.params.toUsername,
            messages: [],
            newMessage: '',
            refreshing: false
        };
    }

    handleSendMessage = () => {
        fetch(`http://localhost:3000/${this.state.username}/${this.state.toUsername}/message`, {
            method: 'PUT',
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
                });
            }
            else
                console.log('Error');
        })
        .catch(err => console.log(err));
    }

    handleRefresh = () => {
        this.setState({
            refreshing: true
        }, () => this.makeRequest());
    }

    makeRequest = () => {
        fetch(`http://localhost:3000/${this.state.username}/${this.state.toUsername}/messages`, {
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

    componentDidMount() {
        this.makeRequest();
    }

    render() {
        return (
            <KeyboardAvoidingView
                behavior='padding'
                keyboardVerticalOffset={70}
                style={styles.container}>
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
                            disabled={this.state.newMessage.length === 0}
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
        marginTop: 5,
    }
});

export default Message;