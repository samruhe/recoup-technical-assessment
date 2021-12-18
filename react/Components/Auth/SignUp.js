import React, { Component } from 'react'
import { SafeAreaView, StyleSheet, Text, TextInput, View, Button } from 'react-native'

class SignUp extends Component {
    state = {
        username: '',
        email: '',
        password: '',
        errorMessage: null
    };

    handleSignUp = () => {
        console.log('handleSignUp')
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.header}>Sign Up</Text>
                {this.state.errorMessage &&
                    <Text style={{ color: 'red' }}>
                        {this.state.errorMessage}
                    </Text>}
                <TextInput
                    placeholder="Email"
                    autoCapitalize="none"
                    onChangeText={email => this.setState({ email })}
                    value={this.state.email}
                />
                <TextInput
                    secureTextEntry
                    placeholder="Password"
                    autoCapitalize="none"
                    onChangeText={password => this.setState({ password })}
                    value={this.state.password}
                />
                <Button title="Sign Up" onPress={this.handleSignUp} />
                <Button
                    title="Already have an account? Login"
                    onPress={() => this.props.navigation.navigate('Login')}
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

export default SignUp;