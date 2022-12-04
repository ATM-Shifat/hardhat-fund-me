//Get Funds from Users
//Withdraw funds
//set a minimum funding value in USD

//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./PriceConverter.sol";

error NotOwner(); // custom error

contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant MINIMUM_USD = 5 * 1e18; // 1 * 10 ** 18
    //transaction cost
    //837381 gas  = non-constant
    //817827 gas = constant

    address[] public funders;
    mapping(address => uint256) public addressToAmount;
    address public immutable i_owner;

    //execution cost
    // 817827 gas = non-immutable
    // 794344 gas = immutable

    AggregatorV3Interface priceFeed;

    constructor(address priceFeedAdress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAdress);
    }

    function fund() public payable {
        require(
            msg.value.getConversionRate(priceFeed) >= MINIMUM_USD,
            "Didn't send enough ether"
        );

        funders.push(msg.sender);
        addressToAmount[msg.sender] = msg.value;
    }

    function withdraw() public onlyOwner {
        //for loop
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];

            addressToAmount[funder] = 0;
        }

        funders = new address[](0);

        //transfer
        //send
        //call
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call Failed");
    }

    modifier onlyOwner() {
        //require(msg.sender == i_owner, "You are not the owner");
        //794344 gas = without custom error
        if (msg.sender != i_owner) {
            revert NotOwner();
        }
        //769245 gas = with custom error
        _;
    }

    //what happens if someone sends this contract without calling the fund function?

    //receive()
    //fallback()

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }
}
