import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

function SingleMessage({ messageInfo, username }) {
    const myMessage = () => {
        return messageInfo.sentBy === username;
    }

    return (
        <View style={message.container}>
            <View style={[
                message.box, {
                    backgroundColor: myMessage() ? 'blue' : 'gray',
                    alignSelf: myMessage() ? 'flex-end' : 'flex-start',
                    maxWidth: '80%'
                }
            ]}>
                <Text style={message.text}>{messageInfo.message}</Text>
            </View>
        </View>
    );
}

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

export default SingleMessage;