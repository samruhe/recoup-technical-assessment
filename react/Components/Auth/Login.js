import React, { Component } from 'react'
import { SafeAreaView, StyleSheet, Text, TextInput, View, Button } from 'react-native'
import firebase from '@react-native-firebase/app';

class Login extends Component {
    state = {
        email: '',
        password: '',
        errorMessage: null
    };
    
    handleLogin = () => {
        firebase
            .auth()
            .signInWithEmailAndPassword(this.state.email.trim(), this.state.password.trim())
            .then(() => this.props.navigation.navigate('Main'))
            .catch(error => {
                if (error.code == 'auth/wrong-password')
                    this.setState({ errorMessage: "Incorrect email/password" });
                else if (error.code = 'auth/invalid-email')
                    this.setState({ errorMessage: "Email address is invalid" });
                else if (error.code == 'auth/user-disabled')
                    this.setState({ errorMessage: "This account has been disabled" });
                else if (error.code == 'auth/user-not-found')
                    this.setState({ errorMessage: "There is no account matching this email" });
            });
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.subContainer}>
                    <Text style={styles.header}>Login</Text>
                    <View style={styles.errorContainer}>
                        {this.state.errorMessage &&
                            <Text style={{ color: 'red' }}>
                                {this.state.errorMessage}
                            </Text>}
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            autoCapitalize="none"
                            placeholder="Email"
                            onChangeText={email => this.setState({ email })}
                            value={this.state.email}
                        />
                        <TextInput
                            style={styles.textInput}
                            secureTextEntry
                            autoCapitalize="none"
                            placeholder="Password"
                            onChangeText={password => this.setState({ password })}
                            value={this.state.password}
                        />
                    </View>
                    <Button title="Login" onPress={this.handleLogin} />
                    <Button
                        title="Don't have an account? Sign Up"
                        onPress={() => this.props.navigation.navigate('SignUp')}
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
        height: 90,
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

export default Login;