// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./IERC20.sol"; 

contract CrowdFund{
    event Launch( //an event for launching the campaign
        uint id, //campaign id
        address indexed owner, //indexing the owner the find the event that associated with the indexed addr.
        uint goal, //goal that is gonna collected 
        uint32 startAt,//start date of the campaign 
        uint32 endAt//End date of the campaign
    );
    event Cancel(uint id);
    event Pledge(uint indexed id,address indexed caller, uint amount);
    event Unpledge(uint indexed id,address indexed caller, uint amount);
    event Claim(uint id);
    event Refund(uint indexed id, address indexed caller,uint amount);
    
    struct Campaign{ //defining the struct
        address owner;
        uint goal;
        uint pledged;
        uint32 startAt;
        uint32 endAt;
        bool claimed;
    }

    IERC20 public immutable token; //IERC20 token declaration
    uint public count; //this will count the campaign count
    mapping(uint => Campaign) public campaigns; //count => campaign mapping
    mapping(uint => mapping(address=>uint)) public pledgedAmount; //this will hold each unique participant's amount how much he/she participated

    constructor(address _token){ //initializes just once when the contract released
        token = IERC20(_token); //token address
    }

    function launch( //campaign launchin func.
        uint _goal,
        uint32 _startAt,
        uint32 _endAt
    ) external {
        require(_startAt >= block.timestamp,"Cannot start campaign earlier than now!");
        require(_endAt >= _startAt,"End must be later than start!");
        require(_endAt <= block.timestamp+90 days,"End is greater than 90 days!");
    //if it passes all checks count is inced for new campaign
        count+=1; 
        campaigns[count]=Campaign({
            owner: msg.sender,
            goal: _goal,
            pledged:0,
            startAt: _startAt,
            endAt:_endAt,
            claimed:false
        });
        emit Launch(count,msg.sender,_goal,_startAt,_endAt);
    }

    function cancel(uint _id) external{ 
        Campaign memory campaign = campaigns[_id]; //variable stored at memory, we're not gonna change any value on chain
        require(msg.sender == campaign.owner,"Only owner can cancel!"); //verifiying the ownership
        require(block.timestamp < campaign.startAt,"Campaign's already started");//cannot start a active campaign
        delete campaigns[_id]; //deleting campaign from our campaign struct array
        emit Cancel(_id); 
    }

    function pledge(uint _id,uint _amount) external {
        Campaign storage campaign = campaigns[_id];//storage  variable,because we're gonna make some alteration on the amounts
        require(block.timestamp>=campaign.startAt,"Campaign is not started!");
        require(block.timestamp <=campaign.endAt,"Campaign is already ended!");
        campaign.pledged += _amount;//adding the pledged amount to the campaign pool
        pledgedAmount[_id][msg.sender] += _amount; //adding pledged amount the mapping
        token.transferFrom(msg.sender,address(this),_amount);//token transfer
    
        emit Pledge(_id,msg.sender,_amount);
    }
    
    function unpledge (uint _id,uint _amount) external {
        Campaign storage campaign = campaigns[_id]; //stored the variable, gonna make some alteration on the amounts
        require(campaign.endAt>=block.timestamp,"Campaign ended!");//campaign must be still active
        
        campaign.pledged -= _amount; //removing the amount that the sender pledged from campaign pledged pool
        pledgedAmount[_id][msg.sender] -= _amount; // it will throw underflow error if the msg.sender didin't contribute at all
        token.transfer(msg.sender,_amount); //in that circumstance all the code below wont run
        emit Unpledge(_id,msg.sender,_amount); //emit the event to the chain
    }
    function claim(uint _id) external {
        Campaign storage campaign = campaigns[_id]; 
        require(msg.sender==campaign.owner,"Not owner of the campaign!");
        require(block.timestamp>campaign.endAt,"Campaign is still active!");
        require(campaign.pledged>=campaign.goal,"Pledge is less than goal!");
        require(!campaign.claimed,"already claimed!");
        campaign.claimed=true;
        token.transfer(msg.sender,campaign.pledged);

        emit Claim(_id);
    }
    
    function refund(uint _id) external{
        Campaign storage campaign = campaigns[_id]; 
        require(block.timestamp>campaign.endAt,"Campaign is still active!");
        require(campaign.pledged<campaign.goal,"Goal is achieved!");

        uint bal = pledgedAmount[_id][msg.sender];
        pledgedAmount[_id][msg.sender] = 0;
        token.transfer(msg.sender,bal);
        emit Refund(_id,msg.sender,bal);


    }

}