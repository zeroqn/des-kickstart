pragma solidity 0.4.15;

/**
 * @title FundLibrary
 * @dev The basic library provide logic implement for fund handling.
 */

import "./BasicMathLib.sol";

library FundLibrary {

    using BasicMathLib for uint;

    struct Fund {
        uint                      totalFund;
        mapping (address => uint) funders;
    }

    function getTotalFund(Fund storage self)
        internal constant returns (uint)
    {
        return self.totalFund;
    }

    function getUserFund(Fund storage self)
        internal constant returns (uint)
    {
        return self.funders[msg.sender];
    }

    function back(Fund storage self)
        internal
    {
        bool overflow;
        uint amount = self.funders[msg.sender];
        (overflow, amount) = amount.plus(msg.value);
        assert(!overflow);

        self.funders[msg.sender] = amount;

        (overflow, self.totalFund) = self.totalFund.plus(msg.value);
        assert(!overflow);
    }

    function withdraw(Fund storage self)
        internal
    {
        bool underflow;
        uint amount = self.funders[msg.sender];
        require(amount > 0);

        self.funders[msg.sender] = 0;
        (underflow, self.totalFund) = self.totalFund.minus(amount);
        assert(!underflow);

        msg.sender.transfer(amount);
    }

    function finish(Fund storage self, address wallet)
        internal
    {
        wallet.transfer(self.totalFund);
    }

}
