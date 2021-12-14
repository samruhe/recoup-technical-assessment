import React, { Component } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function Chat({ data, navigation }) {
    return (
        <TouchableOpacity
            style={chatStyle.container}
            onPress={() => navigation.navigate('Message')}
        >
            <View style={chatStyle.layoutContainer}>
                <View>
                    <Text style={chatStyle.contact}>{data.name}</Text>
                </View>
                <View style={chatStyle.right}>
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
            user: 'Sam',
            messages: []
        };
    }

    componentDidMount() {
        var messageData = [
            {
                name: 'Bob',
                number: '9393938482'
            },
            {
                name: 'Rob',
                number: '72749473844'
            }
        ];

        this.setState({ messages: messageData });
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
            <View>
                <FlatList
                    keyExtractor={message => message.number}
                    data={this.state.messages}
                    renderItem={({item}) => <Chat data={item} navigation={this.props.navigation} />}
                    ItemSeparatorComponent={this.renderSeparator}
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
        fontSize: 20
    },
    layoutContainer: {
        display: 'flex',
        flexDirection: 'row'
    },
    right: {
        position: 'absolute',
        right: 10
    }
});

export default MessagesAll;