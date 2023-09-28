
pragma solidity > 0.8.0;

contract EthTransferInternal {
    function execution(address payable _to) external payable {
        _to.call{value: msg.value}("");
        require(false, "revert");
    }
}

contract EthTransferExternal {
    event Log(string message);
    function execution(address proxy, address payable _to) external payable {
        EthTransferInternal ethTransfer = EthTransferInternal(proxy);
        try ethTransfer.execution{value: msg.value}(_to) {
            emit Log("call successful");
        } catch {
            emit Log("call failed");
        }
    }
}