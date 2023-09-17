// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
// This will report a warning due to deprecated selfdestruct

import "hardhat/console.sol";

contract owned {
    constructor() { owner = payable(msg.sender); }
    address payable owner;
}

contract Destructible is owned {
    function destroy() virtual public {
        console.log("destructible destroy");
        if (msg.sender == owner) selfdestruct(owner);
    }
}

contract Base1 is Destructible {
    function destroy() public virtual override { /* do cleanup 1 */ 
        console.log("base1 destroy");
        super.destroy();
    }
}


contract Base2 is Destructible {
    function destroy() public virtual override { /* do cleanup 2 */ 
        console.log("base2 destroy");
        super.destroy();
    }
}

contract Base3 is Destructible {
    function destroy() public virtual override { /* do cleanup 2 */ 
        console.log("base3 destroy");
        super.destroy();
    }
}

contract Final is Base2, Base1, Base3 {
    function destroy() public override(Base2, Base3, Base1) {
        console.log("final destroy");
        super.destroy();
    }
}