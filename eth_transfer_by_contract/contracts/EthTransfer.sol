// SPDX-License-Identifier: MIT
pragma solidity > 0.8.0;

contract EthTransferInternal {
    address public owner;
    constructor() {
        owner = msg.sender;
    }
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    function execution(address payable _to) external payable onlyOwner {
        _to.call{value: msg.value}("");
        require(false, "revert");
    }
    function withdraw() public onlyOwner {
        address payable _receiver = payable(msg.sender);
        _receiver.call{value: address(this).balance}("");
    }
    receive() external payable {}
}

contract EthTransferExternal {
    event Log(string message);
    address public owner;
    EthTransferInternal public ethTransferInternal;
    constructor() {
        owner = msg.sender;
        ethTransferInternal = new EthTransferInternal();
    }
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    function execution(address payable _to) external payable onlyOwner {
        try ethTransferInternal.execution{value: address(this).balance}(_to) {
            emit Log("call successful");
        } catch {
            emit Log("call failed");
        }
    }
    function withdraw() public onlyOwner {
        ethTransferInternal.withdraw();
        address payable _receiver = payable(msg.sender);
        _receiver.call{value: address(this).balance}("");
    }
    receive() external payable {}
}