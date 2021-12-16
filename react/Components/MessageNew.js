import React, { Component } from 'react';
import { Alert, Button, FlatList, Keyboard, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

function SingleMessage({ messageInfo }) {
    return (
        <View style={message.container}>
            <View style={[
                message.box, {
                    backgroundColor: messageInfo.sent ? 'blue' : 'gray',
                    marginRight: messageInfo.sent ? 0 : 100,
                    marginLeft: messageInfo.sent ? 100 : 0
                }
            ]}>
                <Text style={message.text}>{messageInfo.message}</Text>
            </View>
        </View>
    );
}

class Message extends Component {
    constructor(props) {
        super(props);

        this.state = {
            messages: [],
            newMessage: '',
            contact: ''
        };
    }

    handleSendMessage = () => {
        fetch(`http://localhost:3000/samruhe/${this.state.contact.trim()}/message`, {
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
                    messages: [...this.state.messages, { sent: true, message: this.state.newMessage, time: '11:00' }],
                    newMessage: ''
                }, () => {
                    this.props.navigation.navigate('Message', { name: resJson.name, username: this.state.contact });
                });
            }
            else
                Alert.alert('User does not exist', 'Please make sure the recipent is entered correctly');
        })
        .catch(err => console.log(err));
    }

    makeRequest = () => {
        
    }

    componentDidMount() {
        this.makeRequest();
    }

    render() {
        return (
            <KeyboardAvoidingView
                behavior='padding'
                keyboardVerticalOffset={80}
                style={styles.container}>
                <View style={newMessage.sendTo}>
                    <TextInput
                        autoFocus
                        style={newMessage.sendToInput}
                        placeholder="Send to..."
                        placeholderTextColor="gray"
                        onChangeText={contact => this.setState({ contact })}
                        value={this.state.contact} />
                </View>
                <FlatList
                    inverted
                    data={this.state.messages}
                    contentContainerStyle={{ flexDirection: 'column-reverse' }}
                    renderItem={({ item }) => <SingleMessage messageInfo={item} /> } />
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

const message = StyleSheet.create({
    box: {
        padding: 10,
        borderRadius: 15
    },
    container: {
        padding: 5
    },
    text: {
        fontSize: 15
    }
});

const newMessage = StyleSheet.create({
    buttonContainer: {
        justifyContent: 'center'
    },
    container: {
        flexDirection: 'row',
        backgroundColor: '#A9A9A9',
        paddingBottom: 10
    },
    sendTo: {
        height: 40,
        borderBottomWidth: 1,
        borderBottomColor: 'gray'
    },
    sendToInput: {
        marginTop: 10,
        marginLeft: 10
    },
    subContainer: {
        backgroundColor: 'white',
        margin: 10,
        borderRadius: 20,
        flex: 1,
        minHeight: 40
    },
    textInput: {
        flex: 1,
        marginHorizontal: 5,
        marginTop: 5
    }
});

export default Message;