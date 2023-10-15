interface IVaultConfig {
    /// @dev Return minimum BaseToken debt size per position.
    function minDebtSize() external view returns (uint256);

    /// @dev Return the interest rate per second, using 1e18 as denom.
    function getInterestRate(uint256 debt, uint256 floating) external view returns (uint256);

    /// @dev Return the address of wrapped native token.
    function getWrappedNativeAddr() external view returns (address);

    /// @dev Return the address of wNative relayer.
    function getWNativeRelayer() external view returns (address);

    /// @dev Return the address of fair launch contract.
    function getBigBangAddr() external view returns (address);

    /// @dev Return the bps rate for reserve pool.
    function getReservePoolBps() external view returns (uint256);

    // /// @dev Return the bps rate for Avada Kill caster.
    // function getKillBps() external view returns (uint256);

    /// @dev Return if the caller is whitelisted.
    function whitelistedCallers(address caller) external returns (bool);

    /// @dev Return if the caller is whitelisted.
    // function whitelistedLiquidators(address caller) external returns (bool);

    // /// @dev Return if the given strategy is approved.
    // function approvedAddStrategies(address addStrats) external returns (bool);

    // /// @dev Return whether the given address is a worker.
    // function isWorker(address worker) external view returns (bool);

    // /// @dev Return whether the given worker accepts more debt. Revert on non-worker.
    // function acceptDebt(address worker) external view returns (bool);

    // /// @dev Return the work factor for the worker + BaseToken debt, using 1e4 as denom. Revert on non-worker.
    // function workFactor(address worker, uint256 debt) external view returns (uint256);

    // /// @dev Return the kill factor for the worker + BaseToken debt, using 1e4 as denom. Revert on non-worker.
    // function killFactor(address worker, uint256 debt) external view returns (uint256);

    // /// @dev Return the kill factor for the worker + BaseToken debt without checking isStable, using 1e4 as denom. Revert on non-worker.
    // function rawKillFactor(address worker, uint256 debt) external view returns (uint256);

    // /// @dev Return the portion of reward that will be transferred to treasury account after successfully killing a position.
    // function getKillTreasuryBps() external view returns (uint256);

    /// @dev Return the address of treasury account
    function getTreasuryAddr() external view returns (address);

    // /// @dev Return if worker is stable
    // function isWorkerStable(address worker) external view returns (bool);

    /// @dev Return if reserve that worker is working with is consistent
    // function isWorkerReserveConsistent(address worker) external view returns (bool);
}

interface IVault {
    /// @dev Return the total ERC20 entitled to the token holders. Be careful of unaccrued interests.
    function totalToken() external view returns (uint256);

    /// @dev Add more ERC20 to the bank. Hope to get some good returns.
    function deposit(uint256 amountToken) external payable;

    /// @dev Withdraw ERC20 from the bank by burning the share tokens.
    function withdraw(uint256 share) external;

    function token() external view returns (address);

    function debtToken() external view returns (address);

    function config() external view returns (IVaultConfig);
    function debtShareToVal(uint256 debtShare) external view returns (uint256);
    function debtValToShare(uint256 debtVal) external view returns (uint256);
    function borrow(uint256 debtVal) external returns (uint256);
    function repay(uint256 debtVal) external returns (uint256 debtShare);
    function currentDebtVal() external returns (uint256);
    function vaultDebtShare() external returns (uint256);
    function pendingInterest(uint256 value) external view returns (uint256);
}

interface IPositionMonitor {
    function finalEquities(uint256 id) external view returns (uint256, uint256);
    function positions(uint256 id) external view returns (uint256 value, address token0, address token1, uint16 stopLossRatio);
    // function addPosition  ( uint256 id, address[2] calldata tokens, uint256[2] calldata amounts ) external ;
    function adjustStopLossRatio ( uint256 id, uint16 _stopLossRatio) external;

    function closePosition (
        uint256 id,
        address[2] calldata tokens,
        uint256[2] calldata tokensBack
    ) external ;
    function adjustPosition (uint256 id, uint256 token0Amt, uint256 token1Amt,address token0, address token1) external ;
    function adjustFinalEquity ( uint256 id, address[2] calldata tokens, uint256[2] calldata tokensBack) external ;
    function hasReachedStopLossRatio (uint256 id, uint256 token0Amount, uint256 token1Amount, address token0, address token1) external view returns (bool);

    function hasReachedStopLossRatioDexYield (uint256 id, uint256[] memory amounts, address[] memory tokens, uint256 pendingReward, address rewardToken) external view returns (bool);
    function recordHarvest (uint256 id, uint256 reward, address rewardToken) external;

    // function getFinalEquityValue(uint256 id) external view returns (uint256);
    function getStopLossAmt(address token) external returns (uint256) ;
}

interface IBank {
    /// The governor adds a new bank gets added to the system.
    event AddBank(address token, address cToken);
    /// The governor removes a new bank removed added to the system.
    event RemoveBank(address token, address cToken);
    event SetFeeBps(uint16 stopLossBps, uint16 killBps);
    event SetPositionMonitor (IPositionMonitor positionMonitor);
    /// The governor withdraw tokens from the reserve of a bank.
    event WithdrawReserve(address indexed user, address token, uint amount);
    event SendToArk (uint256 indexed POSITION_ID, address caller, address token, uint amount);
    /// Someone borrows tokens from a bank via a spell caller.
    event Borrow(uint indexed positionId, address caller, address token, uint amount, uint share);
    /// Someone repays tokens to a bank via a spell caller.
    event Repay(uint indexed positionId, address caller, address token, uint amount, uint share);
    /// Someone puts tokens as collateral via a spell caller.
    event PutCollateral(uint indexed positionId, address caller, address token, uint id, uint amount);
    /// Someone takes tokens from collateral via a spell caller.
    event TakeCollateral(uint indexed positionId, address caller, address token, uint id, uint amount);
    /// Someone calls liquidatation on a position, paying debt and taking collateral tokens.
    event Liquidate(
        uint indexed positionId,
        uint collateralSize,
        address collToken,
        uint collId
    );

    event StopLoss(
        uint indexed positionId,
        uint collateralSize,
        address collToken,
        uint collId
    );

    event LongShortPosition(uint indexed positionId);

    /// @dev Return the current position while under execution.
    function POSITION_ID() external view returns (uint);

    /// @dev Return the current target while under execution.
    function WORKER() external view returns (address);

    /// @dev Return the current executor (the owner of the current position).
    function EXECUTOR() external view returns (address);
    function RECEIVER() external view returns (address);
    function stopLossBps() external view returns (uint);
    function killBps() external view returns (uint);
    /// @dev Return bank information for the given token.
    function getBankInfo(address token)
    external
    view
    returns (
        bool isListed,
        address cToken,
    // uint reserve,
        uint totalDebt,
        uint totalShare
    );

    /// @dev Return position information for the given position id.
    function getPositionInfo(uint positionId)
    external
    view
    returns (
        address owner,
        address collToken,
        uint collId,
        uint collateralSize
    );
    /// @dev Return position debts for the given position id.
    function getPositionDebts(uint positionId)
    external view
    returns (address[] memory tokens, uint[] memory debts);

    function getCurrentPositionDebts()
    external view
    returns (address[] memory tokens, uint[] memory debts);

    /// @dev Return the borrow balance for given positon and token without trigger interest accrual.
    function borrowBalanceStored(uint positionId, address token) external view returns (uint);

    /// @dev Trigger interest accrual and return the current borrow balance.
    function borrowBalanceCurrent(uint positionId, address token) external returns (uint);


    function executeByStrategy(
        uint positionId,
        address worker,
        address user,
        bytes[] memory data
    ) external payable returns (uint);

    /// @dev Borrow tokens from the bank.
    function borrow(address token, uint amount) external;

    /// @dev Repays tokens to the bank.
    function repay(address token, uint amountCall) external;

    /// @dev Transmit user assets to the spell.
    function transmit(address token, uint amount) external;

    /// @dev Put more collateral for users.
    function putCollateral(
        address collToken,
        uint collId,
        uint amountCall
    ) external;

    /// @dev Take some collateral back.
    function takeCollateral(
        address collToken,
        uint collId,
        uint amount
    ) external;

    /// @dev Liquidate a position.
    function liquidate( uint positionID) external;

    /// @dev StopLoss a position.
    function stopLoss( uint positionID) external;


    function nextPositionId() external view returns (uint);

    /// @dev Return current position information.
    function getCurrentPositionInfo()
    external
    view
    returns (
        address owner,
        address collToken,
        uint collId,
        uint collateralSize
    );

    // function support(address token) external view returns (bool);
    function banks(address token ) external view returns (bool, uint8, IVault, uint256, uint,uint);
}
