import React, {
    Component
} from 'react';
import getWeb3 from './utils/getWeb3.js';
import './App.css';
import HackathonBetting from './contracts/HackathonBetting';


class BetForm extends Component {
    constructor() {
        super();
        this.state = {
            address: '',
            web3: '',
            teamId: '',
            betAmount: '',
            teams: [{id:1, name:'shubham', betCount:1, totalBetAmount:123}]
        }
        this.getTeamDetails = this.getTeamDetails.bind(this);
        // this.getBetAmount = this.getBetAmount.bind(this);
        this.placeBet = this.placeBet.bind(this);
        this.handleTeamChange = this.handleTeamChange.bind(this);
        this.handleAmountChange = this.handleAmountChange.bind(this);
    }

    getTeamDetails(currentProvider) {
        const contract = require('truffle-contract');
        const HackathonBettingContract = contract(HackathonBetting);
        HackathonBettingContract.setProvider(currentProvider);
        let HackathonBettingInstance;
        HackathonBettingContract.deployed().then((instance) => {
            HackathonBettingInstance = instance;
            return HackathonBettingInstance.teamsCount();
        }).then((rawCount) => {
            const teamsCount = rawCount.toNumber();
            let teamsPromises = [];
            for (let i = 1; i <= teamsCount; i++) {
                teamsPromises.push(HackathonBettingInstance.teams(i));
            }
            teamsPromises
            Promise.all(teamsPromises);
            .then((teams) => {
                let id = team[0];
                let name = team[1];
                let betCount = team[2];
                let totalBetAmount = team[3];
                let newTeams = Array.from(this.state.teams);
                newTeams.push({
                    id, name, betCount, totalBetAmount,
                });
                this.setState({ teams: newTeams});
            });
        }).catch((err)=> {
            console.error(err, ' on getTeamDetails.');
        });
    }

    componentDidMount() {
        getWeb3.then(results => {
            results.web3.eth.getCoinbase((err, acc) => {
                if (err === null) {
                    this.setState({
                        address: acc,
                        web3: results.web3
                    });
                    this.getTeamDetails(results.web3.currentProvider);
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


    handleTeamChange(e) {
        this.setState({
            teamId: parseInt(e.target.value,10)
        });
    }

    handleAmountChange(e) {
        this.setState({
            betAmount: parseInt(e.target.value,10)
        });
    }

    placeBet() {
        console.log(this.state.teamId, this.state.betAmount);
        if(!this.state.teamId) {
			alert('Invalid teamId: ',this.state.teamId);
			return;
		}
		if(!this.state.betAmount) {
			alert('Invalid amount: ',this.state.betAmount);
			return;
		}
        this.state.web3.eth.getBalance(this.state.address,(err, balanceObject) => {
            if(err) {
                console.log(err);
                return;
            }
			let balance = this.state.web3.utils.fromWei(balanceObject,'ether');
			if(this.state.betAmount>balance) {
				alert('Not sufficient balance.');
			} else {
                const contract = require('truffle-contract');
                const HackathonBettingContract = contract(HackathonBetting);
                HackathonBettingContract.setProvider(this.state.web3.currentProvider);
                HackathonBettingContract.deployed().then((instance) => {
                    return instance;
                }).then((instance) => {
					return instance.placeBet(this.state.teamId, { from: this.state.address, value: this.state.betAmount });
                }).then((result)=> {
                    console.log(result);
                })
                .catch(function (err) {
					console.error(err);
				});
			}
		});
		return;
    }


    render() {
        if(this.state.teams && this.state.teams.length) {
            return (
                <div>
                <div>
                    <table>
                         <tr><th>TeamId</th><th>TeamName</th><th>Count of Bets</th><th>Total Bet Amount</th></tr>
                        <tbody>
                        {
                            this.state.teams.map((team, index) => {
                                return <tr key={index}><td>{team.id}</td><td>{team.name}</td><td>{team.betCount}</td><td>{team.totalBetAmount}</td></tr>
                            })
                        }
                        </tbody>
                    </table>
                </div>
                <div>
                    <h5 > Choose Team to Bet on </h5> 
                    <div className = "input-group" onChange= { this.handleTeamChange }>
                        <select className = "form-control">
                        <option>Select Team</option>
                        {
                            this.state.teams.map((team, index) => {
                                return <option value={team.id}>{team.name}</option>
                            })
                        }
                        </select>

                        
                    </div> 
                    <hr/>
                    <h5 > Enter Bet Amount(minimum 1 ETH) </h5> 
                    <div className = "input-group" >
                        <input type = "text"
                        className = "form-control"
                        required pattern = "[0-9]*[.,][0-9]*" onChange= { this.handleAmountChange } />
                        <span className = "input-group-addon" > ETH </span> 
                    </div> 
                    <br/>
                    <button onClick = { this.placeBet} > Bet </button> 
                </div>
                </div>
            );
        } else {
            return <h6>Error Occured</h6>;
        };
    }
}

export default BetForm;