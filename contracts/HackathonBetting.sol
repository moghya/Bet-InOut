pragma solidity ^0.5.8;

contract HackathonBetting {

    struct Team {
        uint id;
        string  name;
        uint  betCount;
        uint  totalBetAmount;
    }

    struct Bet {
        uint tid;
        uint betAmount;
        bool isBetPlaced;
    }

    string public name;
    uint public teamsCount;
    uint public minBetAmount;
    uint public bettorsCount;
    uint public totalHackathonBetAmount;

    mapping(uint => Team) public teams;
    address payable[] bettorAddresses;
    mapping(address => Bet) public bettors;
    
    function addTeam(string memory teamName) public {
        teamsCount++;
        teams[teamsCount] = Team(teamsCount, teamName, 0, 0);
    }

    constructor() public {
        name = "InOut";
        minBetAmount = 1;
        addTeam("SO_REUSEPOSRT");
        addTeam("ANOTHER_TEAM");
        addTeam("YET_ANOTHER_TEAM");
        addTeam("TEAM_IS_THIS");
        addTeam("LOCKED_MUTEX");
        addTeam("OUT_IN_DOWN_UP");
    }

    function placeBet (uint _teamId) public payable {
        require(!bettors[msg.sender].isBetPlaced);
        require(_teamId > 0 && _teamId <= teamsCount);
        uint amount = msg.value;
        bettors[msg.sender] = Bet(_teamId, amount, true);
        teams[_teamId].betCount++;
        bettorsCount++;
        bettorAddresses.push(msg.sender);
        // address payable payableAddress = address(this);
        // address(payableAddress).transfer(amount);
        teams[_teamId].totalBetAmount+= amount;
        totalHackathonBetAmount+= amount;
    }

    function prizeDistribution(uint winnerTeamId) public {
        require(winnerTeamId > 0 && winnerTeamId <= teamsCount);
        uint winningTeamBetAmount = teams[winnerTeamId].totalBetAmount;
        uint totalWonAmount = totalHackathonBetAmount - winningTeamBetAmount;
        for(uint i=1; i <=bettorsCount; i++) {
            address payable bettorAddress = bettorAddresses[i];
            Bet memory bet =  bettors[bettorAddress];
            if(bet.isBetPlaced && winnerTeamId == bet.tid) {
                uint winAmount = bet.betAmount + ((bet.betAmount/winningTeamBetAmount) * totalWonAmount);
                address(bettorAddress).transfer(winAmount);
            }
        }
    }
}