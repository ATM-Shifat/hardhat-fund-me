//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/** @title A Library to aquire price feed from an Aggregator contract
 * @author ATM_Shifat
 * @notice Price feed library
 * @dev PriceConverter is a library that is being used in the FundMe contract
 */

library PriceConverter {
    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        //ABI
        //Eth/USD price feed contract address
        //	0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e

        (, int256 price, , , ) = priceFeed.latestRoundData();

        //price has 8 decimals
        //Ether has 18 decimals as 1 eth = 1e18 wei
        //10 additional 0 is to match the length

        // return uint256(price);
        return uint256(price * 1e10);
    }

    function getDecimals(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        return priceFeed.decimals();
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;

        return ethAmountInUsd;
    }
}
