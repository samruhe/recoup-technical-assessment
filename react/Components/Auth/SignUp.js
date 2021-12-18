import React, { Component } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, View, Button } from 'react-native';
import firebase from '@react-native-firebase/app';

class SignUp extends Component {
    state = {
        username: '',
        email: '',
        password: '',
        errorMessage: ' ',
        existingUsernames: []
    };

    addUserToDB = () => {
        fetch(`http://localhost:3000/add/user/${this.state.username}`, {
            method: 'POST'
        })
        .then(res => res.json())
        .then(resJson => {
            if (resJson.status === 'SUCCESS')
                this.props.navigation.navigate('Main')
        })
        .catch(err => console.log(err));
    }

    handleSignUp = () => {
        firebase
            .auth()
            .createUserWithEmailAndPassword(this.state.email.trim(), this.state.password.trim())
            .then(result => {
                return result.user.updateProfile({
                    displayName: this.state.username
                })
                .then(() => this.addUserToDB())
                .catch(err => console.log(err))
            })
            .catch(error => {
                if (error.code == 'auth/email-already-in-use')
                    this.setState({ errorMessage: "This email is already being used.", submitDisabled: false });
                else if (error.code == 'auth/weak-password')
                    this.setState({ errorMessage: "The entered password is not strong enough.", submitDisabled: false });
                else if (error.code == 'auth/invalid-email')
                    this.setState({ errorMessage: "Please enter a valid email address.", submitDisabled: false });
            });
    }

    checkUsername = () => {
        if (this.state.existingUsernames.includes(this.state.username))
            this.setState({ errorMessage: 'This username already exists.' });
        else
            this.handleSignUp()
    }

    makeRequest = () => {
        fetch(`http://localhost:3000/usernames/all`, {
            method: 'GET'
        })
        .then(res => res.json())
        .then(resJson => {
            if (resJson.status === 'SUCCESS') {
                this.setState({ existingUsernames: resJson.usernames });
            }
        })
        .catch(err => console.log(err));
    }

    componentDidMount() {
        this.makeRequest();
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.subContainer}>
                    <Text style={styles.header}>Sign Up</Text>
                    <View style={styles.errorContainer}>
                        {this.state.errorMessage &&
                            <Text style={{ color: 'red' }}>
                                {this.state.errorMessage}
                            </Text>}
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                                style={styles.textInput}
                                placeholder="Username"
                                autoCapitalize="none"
                                onFocus={() => this.setState({ errorMessage: ' ' })}
                                onChangeText={username => this.setState({ username })}
                                value={this.state.username}
                        />
                        <TextInput
                                style={styles.textInput}
                                placeholder="Email"
                                autoCapitalize="none"
                                onFocus={() => this.setState({ errorMessage: ' ' })}
                                onChangeText={email => this.setState({ email })}
                                value={this.state.email}
                        />
                        <TextInput
                                style={styles.textInput}
                                secureTextEntry
                                placeholder="Password"
                                autoCapitalize="none"
                                onFocus={() => this.setState({ errorMessage: ' ' })}
                                onChangeText={password => this.setState({ password })}
                                value={this.state.password}
                        />
                    </View>
                    <Button title="Sign Up" onPress={this.checkUsername} />
                    <Button
                        title="Already have an account? Login"
                        onPress={() => this.props.navigation.navigate('Login')}
                    />
                </View>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignContent: 'center'
    },
    errorContainer: {
        height: 50,
        marginTop: 20
    },
    header: {
        alignSelf: 'center',
        fontSize: 30
    },
    inputContainer: {
        width: '90%',
        height: 150,
        justifyContent: 'space-between'
    },
    subContainer: {
        marginTop: 50,
        alignItems: 'center'
    },
    textInput: {
        borderBottomWidth: 2,
        borderBottomColor: 'gray',
        height: 40,
    }
});

export default SignUp;