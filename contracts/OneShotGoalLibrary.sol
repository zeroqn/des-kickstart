pragma solidity 0.4.15;

/**
 * @title OneShotGoalLibrary
 * @dev Implement most of logic functions for OneShotGoal. Primary focus on
 * handling fund.
 */

import "./FundraiseLibrary.sol";

library OneShotGoalLibrary {

    using FundraiseLibrary for FundraiseLibrary.Fundraise;

    function getTotalFund(FundraiseLibrary.Fundraise storage fundraise)
        internal constant returns (uint)
    {
        return fundraise.getTotalFund();
    }

    function getUserFund(FundraiseLibrary.Fundraise storage fundraise)
        internal constant returns (uint)
    {
        return fundraise.getUserFund();
    }

    function fund(FundraiseLibrary.Fundraise storage fundraise)
        internal
    {
        fundraise.fund();
    }

    function withdraw(FundraiseLibrary.Fundraise storage fundraise)
        internal
    {
        fundraise.withdraw();
    }

    function finish(
        FundraiseLibrary.Fundraise storage fundraise,
        address wallet)
        internal
    {
        fundraise.finish(wallet);
    }

}
