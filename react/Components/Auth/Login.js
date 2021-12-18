import React, { Component } from 'react'
import { SafeAreaView, StyleSheet, Text, TextInput, View, Button } from 'react-native'

class Login extends Component {
    state = {
        username: '',
        email: '',
        password: '',
        errorMessage: null
    };
    
    handleLogin = () => {
        // TODO: Firebase stuff...
        console.log('handleLogin')
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.header}>Login</Text>
                {this.state.errorMessage &&
                    <Text style={{ color: 'red' }}>
                        {this.state.errorMessage}
                    </Text>}
                <TextInput
                    autoCapitalize="none"
                    placeholder="Email"
                    onChangeText={email => this.setState({ email })}
                    value={this.state.email}
                />
                <TextInput
                    secureTextEntry
                    autoCapitalize="none"
                    placeholder="Password"
                    onChangeText={password => this.setState({ password })}
                    value={this.state.password}
                />
                <Button title="Login" onPress={this.handleLogin} />
                <Button
                    title="Don't have an account? Sign Up"
                    onPress={() => this.props.navigation.navigate('SignUp')}
                />
            </SafeAreaView>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignContent: 'center'
    },
    header: {
        alignSelf: 'center'
    }
});

export default Login;