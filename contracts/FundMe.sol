//Get Funds from Users
//Withdraw funds
//set a minimum funding value in USD

//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./PriceConverter.sol";

error FundMe_NotOwner(); // custom error

/** @title A contract for crowd funding
 * @author ATM_Shifat
 * @notice This is to demo a sample funding contract
 * @dev This implements price feeds as our library. The constructor has an address type parameter
 */

contract FundMe {
    //Type declaration
    using PriceConverter for uint256;

    //State variables
    uint256 public constant MINIMUM_USD = 5 * 1e18; // 1 * 10 ** 18
    address[] public funders;
    mapping(address => uint256) public addressToAmount;
    address public immutable i_owner;
    AggregatorV3Interface public priceFeed;

    //Modifiers
    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert FundMe_NotOwner();
        }
        _;
    }

    //Function Order
    //constractor
    //receive
    //fallback
    //external
    //public
    //internal
    //private
    //view/pure

    constructor(address priceFeedAdress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAdress);
    }

    //what happens if someone sends this contract without calling the fund function?
    //receive , fallback
    //Explanation on : https://solidity-by-example.org/fallback/
    // Ether is sent to the contract
    //         is msg.data empty?
    //             /   \
    //           yes    no
    //           /         \
    //       receive()?  fallback()
    //        /    \
    //     yes      not
    //     /           \
    // receive()    fallback()

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /**
     * @notice This function funds the contract
     * @dev Checks the amount sent to the contract.
     * If enough money is sent , contract gets the fund else the transaction gets reverted.
     * It uses pric feed to get the convertion rate from ETH to USD
     */

    function fund() public payable {
        require(
            msg.value.getConversionRate(priceFeed) >= MINIMUM_USD,
            "Didn't send enough ether"
        );

        funders.push(msg.sender);
        addressToAmount[msg.sender] = msg.value;
    }

    /**
     * @notice This function withdraws funds from the contract
     * @dev Only the owner can call this function
     * If enough money is sent , contract gets the fund else the transaction gets reverted.
     * It uses pric feed to get the convertion rate from ETH to USD
     */

    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];

            addressToAmount[funder] = 0;
        }

        funders = new address[](0);

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call Failed");
    }
}
