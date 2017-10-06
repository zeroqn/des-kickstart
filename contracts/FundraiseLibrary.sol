pragma solidity 0.4.15;

/**
 * @title FundraiseLibrary
 * @dev The basic library provide logic implement for fund handling.
 */

import "./BasicMathLib.sol";

library FundraiseLibrary {

    using BasicMathLib for uint;

    struct Fundraise {
        uint                      totalFund;
        mapping (address => uint) funders;
    }

    function getTotalFund(Fundraise storage self)
        internal constant returns (uint)
    {
        return self.totalFund;
    }

    function getUserFund(Fundraise storage self)
        internal constant returns (uint)
    {
        return self.funders[msg.sender];
    }

    function fund(Fundraise storage self)
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

    function withdraw(Fundraise storage self)
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

    function finish(Fundraise storage self, address wallet)
        internal
    {
        self.totalFund = 0;
        wallet.transfer(self.totalFund);
    }

}
