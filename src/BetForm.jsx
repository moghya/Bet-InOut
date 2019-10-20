import React, {
    Component
} from 'react';
import getWeb3 from './utils/getWeb3.js';
import './App.css';
import HackathonBetting from './contracts/HackathonBetting';


async function getTeams(teamsCount,HackathonBettingInstance) {
    return new Promise(async (resolve)=> {
        let newTeams = [];
        for (let i = 1; i <= teamsCount; i++) {
            let teamRecord = await HackathonBettingInstance.teams(i);
            let id = teamRecord[0].toNumber();
            let name = teamRecord[1];
            let betCount = teamRecord[2].toNumber();
            let totalBetAmount = teamRecord[3].toNumber();
            let team = {id, name, betCount, totalBetAmount};
            console.log(JSON.stringify(team));
            newTeams.push(team);
        }
        resolve(newTeams);
    });
}

class BetForm extends Component {
    constructor() {
        super();
        this.state = {
            address: '',
            web3: '',
            teamId: '',
            betAmount: '',
            teams: []
        }
        this.getTeamDetails = this.getTeamDetails.bind(this);
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
            getTeams(teamsCount, HackathonBettingInstance)
            .then((newTeams)=> {
                this.setState({ teams: newTeams});
                console.log(this.state.teams);
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


    renderTableData() {
        let html = this.state.teams.map((team, index) => <tr key={team.id}> <td>{team.id}</td> <td>{team.name}</td> <td>{team.betCount}</td><td>{team.totalBetAmount}</td></tr>)
        return html;
    }


    render() {
        if(this.state.teams && this.state.teams.length) {
            return (
                <div>
                    <div>
                        <table>
                            <thead>
                                <tr><th>TeamId</th><th>TeamName</th><th>Count of Bets</th><th>Total Bet Amount</th></tr>
                            </thead>
                            <tbody>
                            {
                                this.renderTableData()
                            }
                            </tbody>
                        </table>
                    </div>
                    <div class="betform">
                        <select onChange={this.handleTeamChange}><option>Select Team</option>                
                        {
                            this.state.teams.map((team, index) => {
                                return (
                                    
                                    <option key={index} value={team.id}>{team.name}</option>
                                    
                                );
                            })
                        }
                        </select>
                        <input type="text" onChange={this.handleAmountChange} required="" pattern="[0-9]*[.,][0-9]*" placeholder="Bet Amount (1ETH min)"/>
                        <button onClick={this.placeBet}>Bet</button>
                        <span class="address">Your Address:{ this.state.address }</span>
                    </div>
                </div>
            );
        } else {
            return <h6>Error Occured</h6>;
        };
    }
}

export default BetForm;