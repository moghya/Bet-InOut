import React, {
	Component
} from 'react';


import getWeb3 from './utils/getWeb3.js';
import BetForm from './BetForm';


class App extends Component {
	constructor() {
		super();
		this.state = {
			web3: '',
			address: '',
		};
	}

	componentDidMount() {
		getWeb3.then(results => {
			console.log('how is it working', results);
			results.web3.eth.getCoinbase((err, acc) => {
				if (err === null) {
					console.log(acc);
					this.setState({
						address: acc,
						web3: results.web3
					});
					return results.web3;
				} else {
					console.log(err);
					throw err;
				}
			});
			//At the end of the first promise, we return the loaded web3
		}).catch((err) => {
			//If no web3 provider was found, log it in the console
			console.log('Error finding web3.', err);
		})
	}

	render() {
		return ( <
			div className = "App" >
			<
			header className = "App-header" >

			<
			h1 className = "App-title" > Bet On InOut < /h1> < /
			header > 
 
			 <BetForm / >

			</div>
		);
	}
}

export default App;