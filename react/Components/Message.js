import React, { Component } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

class Message extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: 'Sam',
            messages: []
        };
    }

    componentDidMount() {
        
    }

    render() {
        return (
            <View>
                <Text>Hello</Text>
            </View>
        );
    }
}

export default Message;