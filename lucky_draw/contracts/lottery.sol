// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/VRFV2WrapperConsumerBase.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LuckyDraw is VRFV2WrapperConsumerBase, Ownable {
    //
    event RequestDraw(uint256 requestId, uint256 paid, uint256 maxSoulpassId);
    event FulfillDraw(uint round, uint256 soulpassId, address soulpassOwner, uint256 payment);
    //
    struct RequestDrawStatus {
        uint256 paid;
        uint256[] randomWords;
        uint256 maxSoulpassId;
        uint round;
        bool fulfilled;
    }
    mapping(uint256 => RequestDrawStatus) public requests;
    uint256[] public requestIds;
    uint256 public lastRequestId;
    //
    struct FulfillDrawStatus {
        uint256 soulpassId;
        address soulpassOwner;
        uint256 amount;
    }
    mapping(uint => FulfillDrawStatus) public results;
    mapping(uint256 => uint) winnerRecord;
    //
    address public soulpassAddress;
    uint256 public maxSoulpassId;
    uint public totalRounds;
    uint256 public luckyAmount;
    uint256 public startTimestamp;
    uint256 public endTimestamp;
    //
    constructor(address _linkAddress, address _wrapperAddress, address _soulpassAddress, uint _totalRounds, uint256 _luckyAmount, 
        uint256 _startTimestamp, uint256 _endTimestamp, uint256 _maxSoulpassId) 
        VRFV2WrapperConsumerBase(_linkAddress, _wrapperAddress) {
        soulpassAddress = _soulpassAddress;
        totalRounds = _totalRounds;
        luckyAmount = _luckyAmount;
        startTimestamp = _startTimestamp;
        endTimestamp = _endTimestamp;
        maxSoulpassId = _maxSoulpassId;
    }

    function setTotalRounds(uint _totalRounds) external onlyOwner {
        totalRounds = _totalRounds;
    }
    function setLuckyAmount(uint256 _luckyAmount) external onlyOwner {
        luckyAmount= _luckyAmount;
    }

    //
    function requestDraw(uint32 _callbackGasLimit, uint256 _maxSoulpassId, uint _round) external onlyOwner returns (uint256 requestId) {
        require(block.timestamp > startTimestamp, "lucky draw is not start");
        require(_maxSoulpassId >= maxSoulpassId, "invalid max soulpass id");
        require(_round >= 1 && _round <= totalRounds, "invalid round");
        requestId = requestRandomness(
            _callbackGasLimit,
            uint16(3),
            uint32(1)
        );
        uint256 paid = VRF_V2_WRAPPER.calculateRequestPrice(_callbackGasLimit);
        uint256 balance = LINK.balanceOf(address(this));
        require(balance > paid, "insufficient funds");
        requestIds.push(requestId);
        lastRequestId = requestId;
        maxSoulpassId = _maxSoulpassId;
        //
        requests[requestId] = RequestDrawStatus({
            paid: paid,
            randomWords: new uint256[](0),
            maxSoulpassId: _maxSoulpassId,
            round: _round,
            fulfilled: false
        });
        emit RequestDraw(requestId, paid, _maxSoulpassId);
        return requestId;
    }

    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
        RequestDrawStatus storage request = requests[_requestId];
        require(request.paid > 0, "request is not found");
        require(request.fulfilled == false, "request is fulfilled");
        request.fulfilled = true;
        request.randomWords = _randomWords;
        //
        fulfillDraw(_requestId);
    }

    function fulfillDraw(uint256 _requestId) internal {
        RequestDrawStatus memory request = requests[_requestId];
        require(request.fulfilled == true, "request is not fulfiled");
        require(request.round >= 1 && request.round <= totalRounds, "invalid round");
        uint round = request.round;
        FulfillDrawStatus storage fulfill = results[round];
        require(fulfill.soulpassId == 0, "this round is finished");
        uint256[] memory randomWords = request.randomWords;
        require(randomWords.length >= 1, "invalid random words");
        uint256 randomWord = randomWords[0];
        //
        for (uint i = 0;i < 10;i ++) {
            uint256 random = uint256(keccak256(abi.encodePacked(randomWord, i)));
            uint256 soulpassId = (random % maxSoulpassId) + 1;
            if (winnerRecord[soulpassId] != 0) {
                continue;
            }
            address soulpassOwner = ownerOf(soulpassId);
            if (soulpassOwner == address(0)) {
                continue;
            }
            //
            address payable winner = payable(soulpassOwner);
            (bool success, ) = winner.call{value: luckyAmount}("");
            require(success, "failed to send ether");
            fulfill.soulpassId = soulpassId;
            fulfill.soulpassOwner = soulpassOwner;
            fulfill.amount = luckyAmount;
            winnerRecord[soulpassId] = round;
            emit FulfillDraw(round, soulpassId, soulpassOwner, luckyAmount);
            break;
        }
    }

    function ownerOf(uint256 soulpassId) internal view returns (address) {
        try IERC721(soulpassAddress).ownerOf(soulpassId) returns (address owner) {
            return owner;
        } catch {
            return address(0);
        }
    }

    function getNumberOfRequests() external view returns (uint256) {
        return requestIds.length;
    }

    function getRequestStatus(uint256 _requestId) external view returns(uint256 paid, bool fulfilled, uint256[] memory randomWords, uint256 soulpassId) {
        require(requests[_requestId].paid > 0, "request is not found");
        RequestDrawStatus memory request = requests[_requestId];
        return (request.paid, request.fulfilled, request.randomWords, request.maxSoulpassId);
    }

    function getFulfillStatus(uint _round) external view returns(uint256 soulpassId, address soulpassOwner, uint256 amount) {
        require(_round > 0 && _round <= totalRounds, "round is invalid");
        FulfillDrawStatus memory result = results[_round];
        return (result.soulpassId, result.soulpassOwner, result.amount);
    }

    function isWinner(uint256 _soulpassId) external view returns (bool) {
        return (winnerRecord[_soulpassId] != 0);
    }

    function withdrawLink(address _receiver) public onlyOwner {
        bool success = LINK.transfer(_receiver, LINK.balanceOf(address(this)));
        require(success, "unable to transfer link");
    }

    function withdrawEther(address payable _receiver) public onlyOwner {
        require(block.timestamp > endTimestamp, "withdraw ether is locked");
        (bool success, ) = _receiver.call{value: address(this).balance}("");
        require(success, "failed to send ether");       
    }

    function withdraw(address payable _receiver)  public onlyOwner {
        withdrawLink(_receiver);
        withdrawEther(_receiver);
    }

    receive() external payable {}
}
