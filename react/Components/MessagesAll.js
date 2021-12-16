import React, { Component } from 'react';
import { Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function Chat({ data, navigation }) {
    return (
        <TouchableOpacity
            style={chatStyle.container}
            onPress={() => navigation.navigate('Message', { name: data.name, username: data.username })}
        >
            <View style={chatStyle.layoutContainer}>
                <View>
                    <Text style={chatStyle.contact}>{data.name}</Text>
                    <Text style={chatStyle.lastMessage}>{data.lastMessage}</Text>
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
            username: 'samruhe',
            chats: []
        };
    }

    makeRequest = () => {
        fetch(`http://localhost:3000/${this.state.username}`, {
            method: 'GET'
        })
        .then(res => res.json())
        .then(resJson => {
            this.setState({ chats: resJson.chats });
        })
        .catch(err => console.log(err));
    }

    componentDidMount() {
        this.props.navigation.setOptions({
            headerRight: () => (
                <Button
                    title='+'
                    onPress={() => this.props.navigation.navigate('MessageNew')} />
            )
        });

        this.makeRequest();
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
                    keyExtractor={chat => chat.username}
                    data={this.state.chats}
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
    lastMessage: {
        fontSize: 15
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