// SPDX-License-Identifier: MIT
pragma solidity > 0.8.0;

contract EthTransferInternal {
    address public owner;
    constructor() {
    }
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    function setOwner(address _owner) external {
        require(owner == address(0));
        owner = _owner;
    }
    function execution(address payable _to) external payable onlyOwner {
        _to.call{value: msg.value}("");
        require(false, "revert");
    }
}

contract EthTransferExternal {
    event Log(string message);
    address public owner;
    EthTransferInternal public ethTransferInternal;
    constructor(address _ethTransferInternal) {
        owner = msg.sender;
        ethTransferInternal = EthTransferInternal(_ethTransferInternal);
    }
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    function execution(address payable _to) external payable onlyOwner {
        try ethTransferInternal.execution{value: msg.value}(_to) {
            emit Log("call successful");
        } catch {
            emit Log("call failed");
        }
    }
}