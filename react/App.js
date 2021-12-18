import { createSwitchNavigator, createAppContainer } from 'react-navigation';

import Loading from './Components/Auth/Loading'
import SignUp from './Components/Auth/SignUp'
import Login from './Components/Auth/Login'
import Main from './Components/Auth/Main'

export default createAppContainer(createSwitchNavigator(
	{
		Loading,
		SignUp,
		Login,
		Main
	},
	{
		initialRouteName: 'Loading'
	}
));